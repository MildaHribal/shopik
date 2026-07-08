import type { RouterConfig } from '@nuxt/schema'
import { scrollPositions } from './utils/scrollStore'

// Restoring scroll on back-navigation is timing-sensitive: the out-in page fade
// delays the incoming page's mount and list pages load lazily, so the document
// isn't tall enough immediately. We use our own recorded scroll offset (see
// plugins/scroll-memory.client.ts) and poll a few frames until the page is tall
// enough before restoring — this lands the user exactly where they left off.
export default <RouterConfig> {
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }

    const remembered = import.meta.client ? scrollPositions.get(to.fullPath) : undefined
    const targetTop = remembered ?? savedPosition?.top ?? 0

    // Fresh forward navigations (nothing remembered) just go to the top.
    if (!targetTop) {
      return { top: 0 }
    }

    return new Promise((resolve) => {
      let frames = 0
      const maxFrames = 60 // ~1s cap
      const attempt = () => {
        frames++
        const needed = targetTop + (window.innerHeight || 0)
        const tallEnough = document.documentElement.scrollHeight >= needed
        if (tallEnough || frames >= maxFrames) {
          resolve({ top: targetTop, left: 0 })
        } else {
          requestAnimationFrame(attempt)
        }
      }
      setTimeout(() => requestAnimationFrame(attempt), 60)
    })
  },
}
