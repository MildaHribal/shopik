import { rateLimit } from '~~/server/utils/rate-limit'

/**
 * Global rate-limit middleware. Rules are applied per-URL prefix.
 * Skip GET traffic here to keep browsing snappy; write endpoints are the risk.
 */
export default defineEventHandler((event) => {
  const url = event.node.req.url || ''
  const method = event.node.req.method || 'GET'

  if (url.startsWith('/api/auth/')) {
    // Stricter limit for auth endpoints (login/register brute-force protection).
    if (method !== 'GET') {
      rateLimit(event, { key: 'auth', max: 10, windowMs: 60_000 })
    }
    return
  }

  if (url.startsWith('/api/create-checkout-session') || url.startsWith('/api/orders')) {
    rateLimit(event, { key: 'checkout', max: 20, windowMs: 60_000 })
    return
  }

  if (url.startsWith('/api/admin/')) {
    if (method !== 'GET') {
      rateLimit(event, { key: 'admin', max: 60, windowMs: 60_000 })
    }
    return
  }

  if (url.startsWith('/api/') && method !== 'GET') {
    rateLimit(event, { key: 'api', max: 60, windowMs: 60_000 })
  }
})
