import { getSupabase } from '~~/lib/auth'

export default defineNuxtPlugin(() => {
  const supabase = getSupabase()
  const originalFetch = globalThis.$fetch

  // Add global interceptor to attach Supabase token to API requests
  globalThis.$fetch = globalThis.$fetch.create({
    async onRequest({ options }) {
      // Only add auth header for our API routes
      if (import.meta.client) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            const headers = new Headers(options.headers as HeadersInit || {})
            if (!headers.has('Authorization')) {
              headers.set('Authorization', `Bearer ${session.access_token}`)
            }
            options.headers = headers
          }
        } catch {
          // Ignore auth errors for public endpoints
        }
      }
    },
  })
})
