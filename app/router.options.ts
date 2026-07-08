import type { RouterConfig } from '@nuxt/schema'
import { scrollPositions } from './utils/scrollStore'

// Scroll restoration on back-navigation.
//
// Timing is the hard part: the incoming page renders asynchronously (data +
// lazy images), so we can't scroll immediately. We wait for Nuxt's `page:finish`
// hook (fires once the page component has actually rendered) and then re-apply
// the target scroll for a short window as the page keeps growing — bailing the
// moment the user scrolls themselves. Target comes from Vue Router's
// savedPosition (reliable for browser/router back) with our own recorded offset
// as a fallback (see plugins/scroll-memory.client.ts).
export default <RouterConfig> {
  scrollBehavior(to, from, savedPosition) {
    if (!import.meta.client) {
      return { top: 0 }
    }

    const nuxtApp = useNuxtApp()
    const remembered = scrollPositions.get(to.fullPath)
    const targetTop = savedPosition?.top ?? remembered ?? 0

    const finalize = (resolve: (v: any) => void) => {
      if (to.hash) {
        resolve({ el: to.hash, top: 80, behavior: 'smooth' })
        return
      }
      if (!targetTop) {
        resolve({ top: 0 })
        return
      }

      // Actively restore, re-applying as the page grows; stop if the user scrolls.
      let applied = -1
      const startedAt = Date.now()
      const step = () => {
        const current = window.scrollY
        if (applied !== -1 && Math.abs(current - applied) > 8) return // user took over
        window.scrollTo(0, targetTop)
        applied = window.scrollY // clamped while the page is still short
        if (Date.now() - startedAt < 1800 && Math.abs(applied - targetTop) > 2) {
          requestAnimationFrame(step)
        }
      }
      requestAnimationFrame(step)
      resolve(false) // we handle the scrolling ourselves
    }

    return new Promise((resolve) => {
      let done = false
      const go = () => {
        if (done) return
        done = true
        finalize(resolve)
      }
      // Restore once the incoming page has rendered…
      nuxtApp.hooks.hookOnce('page:finish', go)
      // …with a safety net in case the hook doesn't fire (cached component reuse).
      setTimeout(go, 1000)
    })
  },
}
