import type { APIRoute } from 'astro';
import { ProductService } from '../../db/products';
import { GetProductsPaginatedSchema } from '../../lib/schemas';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse query parameters
    const searchParams = url.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate input using Zod
    const validatedInput = GetProductsPaginatedSchema.parse({ page, limit });
    
    // Get products from database
    const result = await ProductService.getProductsPaginated(
      locals.supabase,
      validatedInput.page,
      validatedInput.limit
    );
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return new Response(
      JSON.stringify({
        data: [],
        count: 0,
        page: 1,
        limit: 10,
        error: 'Błąd podczas pobierania produktów',
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