import React, { memo, useCallback, useMemo, useId } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { ProductWithStock } from '../types';

interface ProductsTableProps {
  products: ProductWithStock[];
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

const StatusBadge = memo<{ status: ProductWithStock['availability_status'] }>(({ status }) => {
  const variants = {
    available: { variant: 'default' as const, label: 'Dostępny', className: 'bg-green-100 text-green-800' },
    low_stock: { variant: 'secondary' as const, label: 'Niski stan', className: 'bg-yellow-100 text-yellow-800' },
    out_of_stock: { variant: 'destructive' as const, label: 'Niedostępny', className: 'bg-red-100 text-red-800' },
  };

  const config = variants[status];
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

const ProductTableSkeleton = memo(() => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex space-x-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      ))}
    </div>
  );
});

ProductTableSkeleton.displayName = 'ProductTableSkeleton';

export const ProductsTable = memo<ProductsTableProps>(({
  products,
  isLoading,
  error,
  onRefresh,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
}) => {
  const searchInputId = useId();
  const filterSelectId = useId();

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange?.(event.target.value);
    },
    [onSearchChange]
  );

  const handleStatusFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onStatusFilterChange?.(event.target.value);
    },
    [onStatusFilterChange]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  }, []);

  const productStats = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.availability_status === 'available').length;
    const lowStock = products.filter(p => p.availability_status === 'low_stock').length;
    const outOfStock = products.filter(p => p.availability_status === 'out_of_stock').length;
    
    return { total, available, lowStock, outOfStock };
  }, [products]);

  if (error) {
    return (
      <Alert>
        <AlertDescription className="flex items-center justify-between">
          <span>Błąd: {error}</span>
          {onRefresh && (
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              className="ml-4"
            >
              Spróbuj ponownie
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista produktów ({productStats.total})</CardTitle>
          {onRefresh && (
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? 'Odświeżanie...' : 'Odśwież'}
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label htmlFor={searchInputId} className="sr-only">
              Szukaj produktów
            </label>
            <input
              id={searchInputId}
              type="text"
              placeholder="Szukaj po nazwie lub SKU..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor={filterSelectId} className="sr-only">
              Filtruj po statusie
            </label>
            <select
              id={filterSelectId}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="available">Dostępne</option>
              <option value="low_stock">Niski stan</option>
              <option value="out_of_stock">Niedostępne</option>
            </select>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">{productStats.available}</div>
            <div className="text-gray-600">Dostępne</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-semibold text-yellow-800">{productStats.lowStock}</div>
            <div className="text-yellow-600">Niski stan</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-semibold text-red-800">{productStats.outOfStock}</div>
            <div className="text-red-600">Niedostępne</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-800">{productStats.total}</div>
            <div className="text-blue-600">Łącznie</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <ProductTableSkeleton />
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Brak produktów do wyświetlenia
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nazwa produktu</TableHead>
                  <TableHead className="text-right">Jednostki do wyprodukowania</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ostatnia aktualizacja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.sku} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">
                        {product.buildable_units.toLocaleString('pl-PL')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.availability_status} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(product.last_updated)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProductsTable.displayName = 'ProductsTable'; 