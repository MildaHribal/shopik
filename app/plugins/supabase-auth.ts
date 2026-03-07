import { useCookie } from '#app'

export default defineNuxtPlugin(() => {
  // Add global interceptor to attach Supabase token to API requests
  globalThis.$fetch = globalThis.$fetch.create({
    onRequest({ options }) {
      const token = useCookie('sb-access-token').value
      if (token) {
        const headers = new Headers(options.headers as HeadersInit || {})
        if (!headers.has('Authorization')) {
           headers.set('Authorization', `Bearer ${token}`)
        }
        options.headers = headers
      }
    },
  })
})
