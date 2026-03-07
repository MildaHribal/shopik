type MotionType = 'shop-fade' | 'shop-slide-left' | 'shop-slide-right' | 'shop-category-shift'

const isProductDetailPath = (path: string) => /^\/product\/[^/]+\/?$/.test(path)
const isCategoryPath = (path: string) => /^\/category\/[^/]+\/?$/.test(path)
const checkoutFlowOrder = ['/cart', '/checkout'] as const

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) {
    return
  }

  // Early signal for CSS to disable blurs/shadows BEFORE snapshot capture
  document.documentElement.classList.add('is-view-transitioning')

  const viewTransitionType = useState<MotionType>('view-transition-type', () => 'shop-fade')

  const fromHome = from.path === '/'
  const toHome = to.path === '/'
  const fromCategory = isCategoryPath(from.path)
  const toCategory = isCategoryPath(to.path)
  const fromProductDetail = isProductDetailPath(from.path)
  const toProductDetail = isProductDetailPath(to.path)
  const fromCheckoutFlowIndex = checkoutFlowOrder.indexOf(from.path as (typeof checkoutFlowOrder)[number])
  const toCheckoutFlowIndex = checkoutFlowOrder.indexOf(to.path as (typeof checkoutFlowOrder)[number])

  let motionType: MotionType = 'shop-fade'
  let fallbackTransition = 'page'

  if (fromCategory && toCategory) {
    motionType = 'shop-category-shift'
    fallbackTransition = 'category-swap'
  } else if (fromHome && (toCategory || toProductDetail)) {
    motionType = 'shop-slide-left'
    fallbackTransition = 'slide-left'
  } else if (toHome && (fromCategory || fromProductDetail)) {
    motionType = 'shop-slide-right'
    fallbackTransition = 'slide-right'
  } else if (
    fromCheckoutFlowIndex !== -1
    && toCheckoutFlowIndex !== -1
    && fromCheckoutFlowIndex !== toCheckoutFlowIndex
  ) {
    const movingForward = toCheckoutFlowIndex > fromCheckoutFlowIndex
    motionType = movingForward ? 'shop-slide-left' : 'shop-slide-right'
    fallbackTransition = movingForward ? 'slide-left' : 'slide-right'
  }

  viewTransitionType.value = motionType

  // Avoid double animations in browsers with native View Transitions support.
  if (document.startViewTransition) {
    to.meta.pageTransition = false
    to.meta.layoutTransition = false
    return
  }

  if (to.meta.pageTransition === false) {
    return
  }

  if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
    to.meta.pageTransition.name = fallbackTransition
    return
  }

  to.meta.pageTransition = {
    name: fallbackTransition,
    mode: 'out-in',
  }
})
