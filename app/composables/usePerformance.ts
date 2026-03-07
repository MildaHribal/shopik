export type PerformanceTier = 'low' | 'mid' | 'high'

export const usePerformance = () => {
  const tier = useState<PerformanceTier>('performance-tier', () => 'mid')
  const isLowEnd = computed(() => tier.value === 'low')
  const isHighEnd = computed(() => tier.value === 'high')
  
  const prefersReducedMotion = useState<boolean>('prefers-reduced-motion', () => false)

  return {
    tier,
    isLowEnd,
    isHighEnd,
    prefersReducedMotion
  }
}
