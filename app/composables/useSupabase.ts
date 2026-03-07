import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const useSupabase = (): SupabaseClient => {
  const config = useRuntimeConfig();
  let supabaseUrl = config.public.supabaseUrl as string;
  let supabaseKey = config.public.supabaseKey as string;

  // Last resort fallback on server side if runtimeConfig isn't overriden by NUXT_ prefix
  if (import.meta.server && (!supabaseUrl || !supabaseKey)) {
    supabaseUrl = supabaseUrl || process.env.SUPABASE_URL || '';
    supabaseKey = supabaseKey || process.env.SUPABASE_KEY || '';
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing (supabaseUrl or supabaseKey). Provide NUXT_PUBLIC_SUPABASE_URL/SUPABASE_URL.');
  }

  return createClient(supabaseUrl, supabaseKey);
};
