-- Migration: Initial Schema for BangProof B2B
-- Description: Creates the initial database schema including all core tables and security policies
-- Author: AI Assistant
-- Date: 2024-07-23

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies table
create table companies (
    id uuid primary key default uuid_generate_v4(),
    name varchar not null,
    address varchar,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create a trigger function to handle company_id in auth.users
create or replace function public.handle_user_company_id()
returns trigger as $$
begin
    -- Add company_id to the user's metadata
    new.raw_user_meta_data = 
        coalesce(new.raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('company_id', new.raw_user_meta_data->>'company_id');
    
    return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically handle company_id
create trigger on_auth_user_created
    before insert on auth.users
    for each row execute procedure public.handle_user_company_id();

-- Enable RLS for companies
alter table companies enable row level security;

-- Companies RLS policies
create policy "Companies are viewable by authenticated users"
    on companies for select
    to authenticated
    using (true);

create policy "Companies are insertable by authenticated users"
    on companies for insert
    to authenticated
    with check (true);

create policy "Companies are updatable by users from the same company"
    on companies for update
    to authenticated
    using (
        id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
    );

-- Products table
create table products (
    sku varchar primary key,
    name varchar not null,
    buildable_units numeric not null default 0,
    last_updated timestamptz not null default now()
);

-- Enable RLS for products
alter table products enable row level security;

-- Products RLS policies
create policy "Products are viewable by all users"
    on products for select
    to anon, authenticated
    using (true);

create policy "Products are insertable by authenticated users"
    on products for insert
    to authenticated
    with check (true);

create policy "Products are updatable by authenticated users"
    on products for update
    to authenticated
    using (true);

-- Reservations table
create table reservations (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    product_sku varchar not null references products(sku),
    quantity integer not null check (quantity > 0),
    reservation_date timestamptz not null default now(),
    expiration_date timestamptz not null,
    status varchar not null check (status in ('pending', 'confirmed', 'expired'))
);

-- Enable RLS for reservations
alter table reservations enable row level security;

-- Reservations RLS policies
create policy "Users can view their own reservations"
    on reservations for select
    to authenticated
    using (user_id = auth.uid());

create policy "Users can create their own reservations"
    on reservations for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Users can update their own reservations"
    on reservations for update
    to authenticated
    using (user_id = auth.uid());

create policy "Users can delete their own reservations"
    on reservations for delete
    to authenticated
    using (user_id = auth.uid());

-- Orders table
create table orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    company_id uuid not null references companies(id) on delete cascade,
    total_amount numeric not null,
    order_date timestamptz not null default now(),
    status varchar not null check (status in ('pending', 'completed', 'cancelled'))
);

-- Enable RLS for orders
alter table orders enable row level security;

-- Orders RLS policies
create policy "Users can view orders from their company"
    on orders for select
    to authenticated
    using (
        company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
    );

create policy "Users can create orders for their company"
    on orders for insert
    to authenticated
    with check (
        company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
    );

create policy "Users can update orders from their company"
    on orders for update
    to authenticated
    using (
        company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
    );

-- Order Items table
create table order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    product_sku varchar not null references products(sku),
    quantity integer not null check (quantity > 0),
    price numeric not null
);

-- Enable RLS for order_items
alter table order_items enable row level security;

-- Order Items RLS policies
create policy "Users can view order items from their company's orders"
    on order_items for select
    to authenticated
    using (
        order_id in (
            select id 
            from orders 
            where company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
        )
    );

create policy "Users can create order items for their company's orders"
    on order_items for insert
    to authenticated
    with check (
        order_id in (
            select id 
            from orders 
            where company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
        )
    );

-- Proformas table
create table proformas (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    proforma_data jsonb not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for proformas
alter table proformas enable row level security;

-- Proformas RLS policies
create policy "Users can view proformas from their company's orders"
    on proformas for select
    to authenticated
    using (
        order_id in (
            select id 
            from orders 
            where company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
        )
    );

create policy "Users can create proformas for their company's orders"
    on proformas for insert
    to authenticated
    with check (
        order_id in (
            select id 
            from orders 
            where company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
        )
    );

-- Invoices table
create table invoices (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references orders(id) on delete cascade,
    invoice_data jsonb not null,
    created_at timestamptz not null default now()
);

-- Enable RLS for invoices
alter table invoices enable row level security;

-- Invoices RLS policies
create policy "Users can view invoices from their company's orders"
    on invoices for select
    to authenticated
    using (
        order_id in (
            select id 
            from orders 
            where company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
        )
    );

create policy "Users can create invoices for their company's orders"
    on invoices for insert
    to authenticated
    with check (
        order_id in (
            select id 
            from orders 
            where company_id::text = ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'company_id')
        )
    );

-- Auth Events table
create table auth_events (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete set null,
    event_type varchar not null,
    auth_data jsonb not null,
    received_at timestamptz not null default now(),
    processed boolean not null default false
);

-- Enable RLS for auth_events
alter table auth_events enable row level security;

-- Auth Events RLS policies
create policy "Users can view their own auth events"
    on auth_events for select
    to authenticated
    using (user_id = auth.uid());

create policy "System can create auth events"
    on auth_events for insert
    to authenticated
    with check (true);

-- Inventory Logs table
create table inventory_logs (
    id uuid primary key default uuid_generate_v4(),
    product_sku varchar not null references products(sku),
    quantity_change numeric not null,
    changed_at timestamptz not null default now(),
    reason text,
    source varchar not null
);

-- Enable RLS for inventory_logs
alter table inventory_logs enable row level security;

-- Inventory Logs RLS policies
create policy "Users can view inventory logs"
    on inventory_logs for select
    to authenticated
    using (true);

create policy "Users can create inventory logs"
    on inventory_logs for insert
    to authenticated
    with check (true);

-- Create indexes
-- Note: We don't need an index on auth.users(company_id) since we're using metadata
create index idx_orders_order_date on orders(order_date);
create index idx_products_last_updated on products(last_updated);
create index idx_reservations_expiration_date on reservations(expiration_date);
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_sku on order_items(product_sku);
create index idx_inventory_logs_product_sku on inventory_logs(product_sku);
create index idx_auth_events_user_id on auth_events(user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at columns
create trigger update_companies_updated_at
    before update on companies
    for each row
    execute function update_updated_at_column(); 