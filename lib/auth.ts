import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!client) {
    const config = useRuntimeConfig();
    let supabaseUrl = (config.public.supabaseUrl as string) || '';
    let supabaseKey = (config.public.supabaseKey as string) || '';
    
    // If running on the server and values are missing from runtimeConfig,
    // fall back to direct environment variables as a last resort.
    if (import.meta.server && (!supabaseUrl || !supabaseKey)) {
      supabaseUrl = supabaseUrl || process.env.SUPABASE_URL || '';
      supabaseKey = supabaseKey || process.env.SUPABASE_KEY || '';
    }
    
    if (!supabaseUrl) {
      const msg = 'Supabase URL is missing! Check environment variables (NUXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).';
      if (import.meta.server) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Configuration Error',
          message: msg
        });
      }
      console.error(msg);
      throw new Error('supabaseUrl is required.');
    }
    
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
}