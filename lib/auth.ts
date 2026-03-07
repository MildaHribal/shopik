import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!client) {
    const config = useRuntimeConfig();
    const supabaseUrl = (config.public.supabaseUrl as string) || '';
    const supabaseKey = (config.public.supabaseKey as string) || '';
    
    if (!supabaseUrl) {
      console.warn('Supabase URL is missing! Check your environment variables (NUXT_PUBLIC_SUPABASE_URL).');
    }
    
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
}