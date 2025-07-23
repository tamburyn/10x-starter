import { createClient, type SupabaseClient as BaseSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase';

// Custom SupabaseClient type for this project
export type SupabaseClient = BaseSupabaseClient<Database>;

/**
 * Create Supabase client instance
 * This should be used in context.locals in Astro routes
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
}

/**
 * Create server-side Supabase client for API routes
 */
export function createSupabaseServerClient(
  supabaseUrl: string,
  serviceRoleKey: string
): SupabaseClient {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} 