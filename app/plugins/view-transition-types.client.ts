type MotionType = 'shop-fade' | 'shop-slide-left' | 'shop-slide-right'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:view-transition:start', (transition: any) => {
    const viewTransitionType = useState<MotionType>('view-transition-type', () => 'shop-fade')
    const activeType = viewTransitionType.value ?? 'shop-fade'

    if (!transition?.types || typeof transition.types.add !== 'function') {
      return
    }

    try {
      transition.types.clear()
      transition.types.add(activeType)
    } catch {
      // Some browsers expose a read-only set.
    }
  })
})
