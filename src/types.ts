// Database types based on PostgreSQL schema
export interface Company {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  company_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  sku: string;
  name: string;
  buildable_units: number;
  last_updated: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  product_sku: string;
  quantity: number;
  reservation_date: string;
  expiration_date: string;
  status: 'pending' | 'confirmed' | 'expired';
}

export interface Order {
  id: string;
  user_id: string;
  company_id: string;
  total_amount: number;
  order_date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_sku: string;
  quantity: number;
  price: number;
}

// Dashboard specific types
export interface ProductWithStock extends Product {
  availability_status: 'available' | 'low_stock' | 'out_of_stock';
  reserved_units?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
} 