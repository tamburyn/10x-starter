import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProductWithStock, ApiResponse } from '../../types';
import type { SupabaseClient } from '../../db/supabase.client';
import { ProductService } from '../../db/products';

interface UseProductsOptions {
  supabase: SupabaseClient;
  enableRealtime?: boolean;
  initialData?: ProductWithStock[];
}

interface UseProductsReturn {
  products: ProductWithStock[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filteredProducts: ProductWithStock[];
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  searchQuery: string;
  statusFilter: string;
}

export function useProducts({ 
  supabase, 
  enableRealtime = true, 
  initialData = [] 
}: UseProductsOptions): UseProductsReturn {
  const [products, setProducts] = useState<ProductWithStock[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.length);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: ApiResponse<ProductWithStock[]> = await ProductService.getProductsWithStock(supabase);
      
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        setError(response.error || 'Błąd podczas pobierania produktów');
      }
    } catch (err) {
      setError('Nieoczekiwany błąd podczas pobierania produktów');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search query and status
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (product) => product.availability_status === statusFilter
      );
    }

    return filtered;
  }, [products, searchQuery, statusFilter]);

  // Initial data fetch
  useEffect(() => {
    if (!initialData.length) {
      fetchProducts();
    }
  }, [fetchProducts, initialData.length]);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const subscription = ProductService.subscribeToProducts(supabase, (payload) => {
      console.log('Real-time update received:', payload);
      // Refetch data when changes occur
      refetch();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [enableRealtime, supabase, refetch]);

  return {
    products,
    isLoading,
    error,
    refetch,
    filteredProducts,
    setSearchQuery,
    setStatusFilter,
    searchQuery,
    statusFilter,
  };
} 