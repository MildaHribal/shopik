import { createAuthClient } from 'better-auth/vue'

let _client: ReturnType<typeof createAuthClient> | null = null

export const authClient = () => {
  if (_client) return _client
  const config = useRuntimeConfig()
  const baseURL = (config.public.siteUrl as string) || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  _client = createAuthClient({ baseURL })
  return _client
}
