import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Server-side Supabase client with service role key for admin operations.
 * Lazy-initialized to avoid errors during module import if env vars are missing.
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!client) {
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Supabase configuration missing',
        message: 'SUPABASE_URL and SUPABASE_SERVICE_KEY are required in environment.'
      })
    }
    
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return client
}

// For backward compatibility if needed, but getSupabaseAdmin() is preferred
export const supabaseAdmin = () => getSupabaseAdmin()