# Schemat Bazy Danych PostgreSQL dla BangProof B2B

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### Tabela `companies`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `name` VARCHAR NOT NULL
- `address` VARCHAR NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### Tabela `users`

This table is managed by Supabase Auth

- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `company_id` UUID REFERENCES companies(id) ON DELETE SET NULL
- `email` VARCHAR NOT NULL UNIQUE
- `password_hash` VARCHAR NOT NULL  -- Zakłada wykorzystanie haszowania haseł
- `first_name` VARCHAR NOT NULL
- `last_name` VARCHAR NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### Tabela `products`
- `sku` VARCHAR PRIMARY KEY
- `name` VARCHAR NOT NULL
- `buildable_units` NUMERIC NOT NULL DEFAULT 0
- `last_updated` TIMESTAMPTZ NOT NULL

### Tabela `reservations`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `product_sku` VARCHAR NOT NULL REFERENCES products(sku)
- `quantity` INTEGER NOT NULL CHECK (quantity > 0)
- `reservation_date` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `expiration_date` TIMESTAMPTZ NOT NULL
- `status` VARCHAR NOT NULL CHECK (status IN ('pending', 'confirmed', 'expired'))

### Tabela `orders`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `company_id` UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE
- `total_amount` NUMERIC NOT NULL
- `order_date` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `status` VARCHAR NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled'))

### Tabela `order_items`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `order_id` UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
- `product_sku` VARCHAR NOT NULL REFERENCES products(sku)
- `quantity` INTEGER NOT NULL CHECK (quantity > 0)
- `price` NUMERIC NOT NULL

### Tabela `proformas`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `order_id` UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
- `proforma_data` JSONB NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### Tabela `invoices`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `order_id` UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
- `invoice_data` JSONB NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()

### Tabela `auth_events`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID REFERENCES users(id) ON DELETE SET NULL
- `event_type` VARCHAR NOT NULL  -- np. 'login', 'registration'
- `auth_data` JSONB NOT NULL  -- przechowuje dane z webhook n8n
- `received_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `processed` BOOLEAN NOT NULL DEFAULT FALSE

### Tabela `inventory_logs`
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `product_sku` VARCHAR NOT NULL REFERENCES products(sku)
- `quantity_change` NUMERIC NOT NULL
- `changed_at` TIMESTAMPTZ NOT NULL DEFAULT NOW()
- `reason` TEXT NULL
- `source` VARCHAR NOT NULL  -- np. 'Shopify', 'BigQuery'

## 2. Relacje między tabelami

- `companies` 1-to-many `users` (jeden podmiot może mieć wielu użytkowników)
- `users` many-to-one `companies`
- `users` 1-to-many `orders`
- `products` 1-to-many `reservations`
- `users` 1-to-many `reservations`
- `orders` 1-to-many `order_items`
- `products` 1-to-many `order_items`
- `orders` 1-to-1 `proformas` (relacja 1-do-1, możliwe utworzenie unikalnego indeksu)
- `orders` 1-to-1 `invoices`
- `users` 1-to-many `auth_events`
- `products` 1-to-many `inventory_logs`

## 3. Indeksy

- Indeks na `users.email` (unikalny)
- Indeks na `orders.order_date` dla szybkich zapytań wg daty
- Indeks na `products.last_updated` dla aktualizacji stanu magazynowego
- Indeks na `reservations.expiration_date` do wyszukiwania przeterminowanych rezerwacji
- Indeksy na kolumnach kluczy obcych, np. `users.company_id`, `order_items.order_id`, `order_items.product_sku` itd.

## 4. Zasady PostgreSQL

- Użycie rozszerzenia `uuid-ossp` dla generowania UUID, np.: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
- Stosowanie `TIMESTAMPTZ` dla przechowywania znaczników czasowych z uwzględnieniem stref czasowych
- Wykorzystanie ograniczeń (CHECK, NOT NULL, UNIQUE) dla zapewnienia integralności danych
- Użycie typów JSONB w tabelach `auth_events`, `proformas`, `invoices` dla elastycznego przechowywania danych zewnętrznych (np. z webhooków)

## 5. Dodatkowe uwagi i wyjaśnienia

- Schemat obsługuje kluczowe funkcjonalności wymagane przez PRD: rejestracja/logowanie, rezerwacja produktów, składanie zamówień oraz automatyczne wystawianie dokumentów (proformy i faktury).
- Tabela `auth_events` została zaprojektowana z myślą o nowej formie autentykacji, gdzie dane z webhook n8n mogą być przesyłane i przechowywane w bazie danych.
- Tabela `inventory_logs` umożliwia śledzenie zmian stanu magazynowego, co wspiera funkcjonalności real-time availability.
- Schemat jest znormalizowany do 3NF przy jednoczesnym zachowaniu wydajności dzięki zastosowanym indeksom i kluczom obcym.
- Ewentualna denormalizacja może być rozważona w przyszłości, w przypadku wystąpienia problemów z wydajnością przy dużej liczbie transakcji. 