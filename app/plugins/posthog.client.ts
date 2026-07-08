import posthog from 'posthog-js'

/**
 * PostHog product analytics (client-side).
 *
 * Init only fires when NUXT_PUBLIC_POSTHOG_KEY is set, so dev machines and
 * previews without the key stay silent. Pageviews (incl. SPA route changes)
 * and pageleaves are handled automatically by the `defaults` config below.
 *
 * Usage in components:  const { $posthog } = useNuxtApp()
 *                       $posthog()?.capture('add_to_cart', { itemId })
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const key = config.public.posthogKey as string
  const host = (config.public.posthogHost as string) || 'https://eu.i.posthog.com'

  if (!key) return

  let client: ReturnType<typeof posthog.init> | undefined

  const start = () => {
    if (client) return
    client = posthog.init(key, {
      api_host: host,
      defaults: '2025-05-24',
      person_profiles: 'identified_only',
      // Session Replay privacy. Recording still has to be switched on in
      // PostHog → Settings → Session Replay ("Record user sessions"); this
      // block only controls WHAT gets masked once it is on.
      //   - maskAllInputs: every form field value (name, email, address, phone
      //     in checkout) is masked — Stripe card fields live in an iframe and are
      //     never captured anyway.
      //   - add `data-ph-mask` to any RENDERED text element (order summary,
      //     account details) to mask personal data that isn't in an <input>.
      //   - add `ph-no-capture` class to fully block an element from recording.
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
      loaded: (ph) => {
        if (import.meta.dev) ph.debug()
      },
    })
  }

  // Defer init until the browser is idle so analytics/session-replay never
  // competes with hydration or the first paint (keeps page load snappy).
  if (typeof (window as any).requestIdleCallback === 'function') {
    ;(window as any).requestIdleCallback(start, { timeout: 3000 })
  } else {
    setTimeout(start, 1500)
  }

  return {
    provide: {
      // Callers use $posthog()?.capture(...) — null until init finishes, which
      // is fine for fire-and-forget analytics right after load.
      posthog: () => client,
    },
  }
})
