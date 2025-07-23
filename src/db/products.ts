import type { SupabaseClient } from './supabase.client';
import type { Product, ProductWithStock, ApiResponse, PaginatedResponse } from '../types';

/**
 * Product service for managing product data from Supabase
 */
export class ProductService {
  /**
   * Get all products from the database
   */
  static async getAllProducts(supabase: SupabaseClient): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data: data || [],
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error fetching products:', error);
      return {
        data: null,
        error: 'An unexpected error occurred',
        success: false,
      };
    }
  }

  /**
   * Get products with stock status calculation
   */
  static async getProductsWithStock(supabase: SupabaseClient): Promise<ApiResponse<ProductWithStock[]>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching products with stock:', error);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      // Calculate availability status based on buildable_units
      const productsWithStock: ProductWithStock[] = (data || []).map((product) => ({
        ...product,
        availability_status: this.calculateAvailabilityStatus(product.buildable_units),
      }));

      return {
        data: productsWithStock,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error fetching products with stock:', error);
      return {
        data: null,
        error: 'An unexpected error occurred',
        success: false,
      };
    }
  }

  /**
   * Get a single product by SKU
   */
  static async getProductBySku(supabase: SupabaseClient, sku: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sku', sku)
        .single();

      if (error) {
        console.error('Error fetching product by SKU:', error);
        return {
          data: null,
          error: error.message,
          success: false,
        };
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Unexpected error fetching product by SKU:', error);
      return {
        data: null,
        error: 'An unexpected error occurred',
        success: false,
      };
    }
  }

  /**
   * Get paginated products
   */
  static async getProductsPaginated(
    supabase: SupabaseClient,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Product>> {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching paginated products:', error);
        return {
          data: [],
          count: 0,
          page,
          limit,
        };
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Unexpected error fetching paginated products:', error);
      return {
        data: [],
        count: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Calculate availability status based on buildable units
   */
  private static calculateAvailabilityStatus(buildableUnits: number): ProductWithStock['availability_status'] {
    if (buildableUnits === 0) {
      return 'out_of_stock';
    } else if (buildableUnits <= 10) {
      return 'low_stock';
    } else {
      return 'available';
    }
  }

  /**
   * Subscribe to real-time changes in products table
   */
  static subscribeToProducts(supabase: SupabaseClient, callback: (payload: any) => void) {
    return supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        callback
      )
      .subscribe();
  }
} 