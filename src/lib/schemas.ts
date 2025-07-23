import { z } from 'zod';

// Product schemas
export const ProductSchema = z.object({
  sku: z.string().min(1, 'SKU jest wymagane'),
  name: z.string().min(1, 'Nazwa produktu jest wymagana'),
  buildable_units: z.number().min(0, 'Liczba jednostek nie może być ujemna'),
  last_updated: z.string().datetime(),
});

export const ProductWithStockSchema = ProductSchema.extend({
  availability_status: z.enum(['available', 'low_stock', 'out_of_stock']),
  reserved_units: z.number().optional(),
});

// Company schemas
export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nazwa firmy jest wymagana'),
  address: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid().nullable(),
  email: z.string().email('Nieprawidłowy adres email'),
  first_name: z.string().min(1, 'Imię jest wymagane'),
  last_name: z.string().min(1, 'Nazwisko jest wymagane'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// API Response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: z.string().nullable(),
    success: z.boolean(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    count: z.number(),
    page: z.number(),
    limit: z.number(),
  });

// Specific API response schemas
export const ProductsResponseSchema = ApiResponseSchema(z.array(ProductSchema));
export const ProductsWithStockResponseSchema = ApiResponseSchema(z.array(ProductWithStockSchema));
export const SingleProductResponseSchema = ApiResponseSchema(ProductSchema);
export const PaginatedProductsResponseSchema = PaginatedResponseSchema(ProductSchema);

// Input validation schemas
export const GetProductBySkuSchema = z.object({
  sku: z.string().min(1, 'SKU jest wymagane'),
});

export const GetProductsPaginatedSchema = z.object({
  page: z.number().min(1, 'Numer strony musi być większy od 0').default(1),
  limit: z.number().min(1).max(100, 'Limit nie może przekraczać 100').default(10),
});

// Type exports for convenience
export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductWithStockInput = z.infer<typeof ProductWithStockSchema>;
export type CompanyInput = z.infer<typeof CompanySchema>;
export type UserInput = z.infer<typeof UserSchema>;
export type GetProductBySkuInput = z.infer<typeof GetProductBySkuSchema>;
export type GetProductsPaginatedInput = z.infer<typeof GetProductsPaginatedSchema>; 