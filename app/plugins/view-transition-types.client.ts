type MotionType = 'shop-fade' | 'shop-slide-left' | 'shop-slide-right' | 'shop-category-shift'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const removeTransitionClass = () => {
    document.documentElement.classList.remove('is-view-transitioning')
  }

  // 1. Handle Native View Transitions
  nuxtApp.hook('page:view-transition:start', (transition: any) => {
    const viewTransitionType = useState<MotionType>('view-transition-type', () => 'shop-fade')
    const activeType = viewTransitionType.value ?? 'shop-fade'

    // We already added the class in middleware, but ensuring it here too
    document.documentElement.classList.add('is-view-transitioning')

    if (transition?.types && typeof transition.types.add === 'function') {
      try {
        transition.types.clear()
        transition.types.add(activeType)
      } catch { /* Read-only set fallback */ }
    }

    // Cleanup when native transition finishes
    if (transition?.finished) {
      transition.finished.finally(removeTransitionClass)
    } else {
      removeTransitionClass()
    }
  })

  // 2. Fallback for Vue Transitions (if native VT is skipped or not supported)
  nuxtApp.hook('page:transition:finish', () => {
    // Small delay to ensure the browser has finished painting the new state
    requestAnimationFrame(() => {
      removeTransitionClass()
    })
  })

  // 3. Safety cleanup for navigation errors
  nuxtApp.hook('app:error', removeTransitionClass)
})
