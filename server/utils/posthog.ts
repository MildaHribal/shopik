import { PostHog } from 'posthog-node'

/**
 * Server-side PostHog client for capturing backend events (e.g. paid orders
 * from the Stripe webhook, where the browser can't be trusted to fire them).
 *
 * Returns null when NUXT_PUBLIC_POSTHOG_KEY is not configured, so callers can
 * no-op safely in dev/preview. In serverless/Nitro handlers, call
 * `await client.shutdown()` after capturing to flush the queue before the
 * function returns (posthog-node batches by default).
 */
let cached: PostHog | null | undefined

export function usePosthogServer(): PostHog | null {
  if (cached !== undefined) return cached

  const config = useRuntimeConfig()
  const key = config.public.posthogKey as string
  const host = (config.public.posthogHost as string) || 'https://eu.i.posthog.com'

  cached = key
    ? new PostHog(key, { host, flushAt: 1, flushInterval: 0 })
    : null

  return cached
}
