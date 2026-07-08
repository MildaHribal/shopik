import { scrollPositions } from '~/utils/scrollStore'

// Record the outgoing page's real scroll offset the moment a navigation starts,
// keyed by its path. router.options.ts restores from this on the way back.
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  router.beforeEach((to, from) => {
    if (import.meta.client && from.fullPath) {
      scrollPositions.set(from.fullPath, window.scrollY || window.pageYOffset || 0)
    }
  })
})
