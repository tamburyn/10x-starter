import type { APIRoute } from 'astro';
import { ProductService } from '../../../db/products';
import { GetProductBySkuSchema } from '../../../lib/schemas';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const sku = params.sku;
    
    if (!sku) {
      return new Response(
        JSON.stringify({
          data: null,
          error: 'SKU jest wymagane',
          success: false,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Validate input using Zod
    const validatedInput = GetProductBySkuSchema.parse({ sku });
    
    // Get product from database
    const result = await ProductService.getProductBySku(
      locals.supabase,
      validatedInput.sku
    );
    
    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({
        data: null,
        error: 'Błąd podczas pobierania produktu',
        success: false,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}; 