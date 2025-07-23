import type { MiddlewareHandler } from 'astro';
import { createSupabaseClient } from '../db/supabase.client';
import type { SupabaseClient } from '../db/supabase.client';
import { AuthService } from '../lib/auth';

// Extend Astro's locals type
declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user?: any;
      isAuthenticated: boolean;
    }
  }
}

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/products', '/orders', '/api/products'];

// Public routes that should redirect if authenticated
const PUBLIC_ROUTES = ['/login', '/register'];

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Get environment variables
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  // Create Supabase client and add to context.locals
  context.locals.supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  
  // Initialize auth defaults
  context.locals.isAuthenticated = false;
  context.locals.user = null;

  // Check authentication status
  try {
    const authService = new AuthService(context.locals.supabase);
    const session = await authService.getSession();
    
    if (session?.user) {
      context.locals.isAuthenticated = true;
      context.locals.user = session.user;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Continue with unauthenticated state
  }

  const pathname = context.url.pathname;

  // Handle protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!context.locals.isAuthenticated) {
      // Redirect to login for unauthenticated users
      if (pathname.startsWith('/api/')) {
        // Return 401 for API routes
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        // Redirect to login for page routes
        return context.redirect('/login');
      }
    }
  }

  // Handle public auth routes (redirect if already authenticated)
  if (PUBLIC_ROUTES.includes(pathname) && context.locals.isAuthenticated) {
    return context.redirect('/dashboard');
  }

  // Continue to the next middleware or route handler
  return next();
}; 