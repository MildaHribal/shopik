export default defineNuxtPlugin((nuxtApp) => {
  const { tier, prefersReducedMotion } = usePerformance()

  if (import.meta.client) {
    // 1. Detect Prefers Reduced Motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
      updateDocClasses()
    })

    // 2. Detect Device Tier
    const getPerformanceTier = (): 'low' | 'mid' | 'high' => {
      // 2a. Check connection speed
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g' || connection.saveData)) {
        return 'low'
      }

      // 2b. Check hardware
      const memory = (navigator as any).deviceMemory ?? 4
      const cores = navigator.hardwareConcurrency ?? 4
      
      // Heuristic for low-end devices (e.g. 2GB RAM or 2 cores)
      if (memory <= 2 || cores <= 2) {
        return 'low'
      }
      
      // Heuristic for mid-range (e.g. 4GB RAM or 4 cores)
      if (memory <= 4 || cores <= 4) {
        return 'mid'
      }
      
      return 'high'
    }

    tier.value = getPerformanceTier()

    const updateDocClasses = () => {
      const html = document.documentElement
      
      // Remove previous tier classes
      html.classList.remove('is-low-end', 'is-mid-end', 'is-high-end', 'prefers-reduced-motion')
      
      // Add current tier class
      html.classList.add(`is-${tier.value}-end`)
      
      if (prefersReducedMotion.value) {
        html.classList.add('prefers-reduced-motion')
      }
    }

    updateDocClasses()
  }
})
