import type { H3Event } from 'h3'
import { getRequestIP, getHeader } from 'h3'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function clientKey(event: H3Event, prefix: string) {
  const forwarded = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return `${prefix}:${ip}`
}

/**
 * Sliding-window rate limiter (in-memory). Sufficient for a single Node instance;
 * for multi-instance deployments, back this with Redis.
 */
export function rateLimit(
  event: H3Event,
  opts: { key: string; max: number; windowMs: number },
) {
  const now = Date.now()
  const key = clientKey(event, opts.key)
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return
  }

  bucket.count += 1
  if (bucket.count > opts.max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      data: { retryAfter },
    })
  }
}

// Best-effort periodic cleanup so the map does not grow forever.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key)
    }
  }, 60_000).unref?.()
}
