import { useCookie } from '#app'

export default defineNuxtPlugin(() => {
  const authCookie = useCookie('sb-access-token')

  // Add global interceptor to attach Supabase token to API requests
  globalThis.$fetch = globalThis.$fetch.create({
    onRequest({ options }) {
      const token = authCookie.value
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
