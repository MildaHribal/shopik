type MotionType = 'shop-fade' | 'shop-slide-left' | 'shop-slide-right'

const isProductDetailPath = (path: string) => /^\/product\/[^/]+\/?$/.test(path)

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) {
    return
  }

  const viewTransitionType = useState<MotionType>('view-transition-type', () => 'shop-fade')

  const fromHome = from.path === '/'
  const toHome = to.path === '/'
  const fromProductDetail = isProductDetailPath(from.path)
  const toProductDetail = isProductDetailPath(to.path)

  let motionType: MotionType = 'shop-fade'
  let fallbackTransition = 'page'

  if (fromHome && toProductDetail) {
    motionType = 'shop-slide-left'
    fallbackTransition = 'slide-left'
  } else if (fromProductDetail && toHome) {
    motionType = 'shop-slide-right'
    fallbackTransition = 'slide-right'
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
