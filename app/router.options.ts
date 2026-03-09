import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig> {
  scrollBehavior(to, from, savedPosition) {
    let position: any = { top: 0 }

    // Wait for page transitions and hydration
    return new Promise((resolve) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
        } else if (to.hash) {
          resolve({ el: to.hash, behavior: 'smooth' })
        } else {
          resolve({ top: 0 })
        }
      }, 300)
    })
  }
}
