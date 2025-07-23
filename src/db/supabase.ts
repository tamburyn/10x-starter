import type { Product, Company, User, Reservation, Order, OrderItem } from '../types';

// Define the database schema type
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'last_updated'>;
        Update: Partial<Omit<Product, 'sku'>>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      reservations: {
        Row: Reservation;
        Insert: Omit<Reservation, 'id' | 'reservation_date'>;
        Update: Partial<Omit<Reservation, 'id' | 'reservation_date'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'order_date'>;
        Update: Partial<Omit<Order, 'id' | 'order_date'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
    };
  };
}

// Export database types for convenience
export type { Database }; 