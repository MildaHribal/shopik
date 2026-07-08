import type { RouterConfig } from '@nuxt/schema'

// Restoring scroll on back-navigation is timing-sensitive: the out-in page fade
// delays the incoming page's mount, and list pages load data lazily, so the
// document isn't tall enough immediately. Instead of a fixed delay we poll a few
// frames until the page is tall enough for the saved position, then restore.
export default <RouterConfig> {
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }

    const target = savedPosition ?? { top: 0 }
    if (import.meta.client) console.log('[scrollDbg] saved=', JSON.stringify(savedPosition), 'to=', to.fullPath)

    // Fresh forward navigations just go to the top — no need to wait.
    if (!savedPosition) {
      return target
    }

    return new Promise((resolve) => {
      let frames = 0
      const maxFrames = 45 // ~750ms cap
      const attempt = () => {
        frames++
        const needed = (target.top || 0) + (window.innerHeight || 0)
        const tallEnough = document.documentElement.scrollHeight >= needed
        if (tallEnough || frames >= maxFrames) {
          resolve(target)
        } else {
          requestAnimationFrame(attempt)
        }
      }
      // Let the incoming page begin mounting after the fade, then poll.
      setTimeout(() => requestAnimationFrame(attempt), 60)
    })
  },
}
