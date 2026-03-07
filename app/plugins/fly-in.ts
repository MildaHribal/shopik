type FlyDirection = 'up' | 'down' | 'left' | 'right' | 'zoom'

interface FlyOptions {
  direction?: FlyDirection
  delay?: number
  duration?: number
  distance?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
}

const DIRECTION_CLASSES = ['fly-in--up', 'fly-in--down', 'fly-in--left', 'fly-in--right', 'fly-in--zoom'] as const

const observers = new WeakMap<HTMLElement, IntersectionObserver>()
const FLY_OPTIONS_KEY = Symbol('fly-options')

type FlyElement = HTMLElement & {
  [FLY_OPTIONS_KEY]?: ReturnType<typeof normalizeOptions>
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const normalizeOptions = (value: FlyDirection | FlyOptions | undefined) => {
  const source = typeof value === 'string' ? { direction: value } : (value ?? {})

  return {
    direction: (source.direction ?? 'up') as FlyDirection,
    delay: clamp(source.delay ?? 0, 0, 2000),
    duration: clamp(source.duration ?? 820, 240, 2200),
    distance: clamp(source.distance ?? 48, 12, 160),
    once: source.once ?? true,
    threshold: clamp(source.threshold ?? 0.08, 0, 1),
    rootMargin: source.rootMargin ?? '0px 0px 16% 0px',
  }
}

const cleanup = (el: HTMLElement) => {
  const observer = observers.get(el)
  observer?.disconnect()
  observers.delete(el)
}

const prepareElement = (el: HTMLElement, options: ReturnType<typeof normalizeOptions>) => {
  cleanup(el)

  el.classList.add('fly-in')
  el.classList.remove('fly-in--visible')
  for (const className of DIRECTION_CLASSES) {
    el.classList.remove(className)
  }
  el.classList.add(`fly-in--${options.direction}`)

  el.style.setProperty('--fly-delay', `${options.delay}ms`)
  el.style.setProperty('--fly-duration', `${options.duration}ms`)
  el.style.setProperty('--fly-distance', `${options.distance}px`)
}

const makeVisible = (el: HTMLElement) => {
  el.classList.add('fly-in--visible')
}

const mountObserver = (el: HTMLElement, options: ReturnType<typeof normalizeOptions>) => {
  if (import.meta.server) {
    makeVisible(el)
    return
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion || typeof window.IntersectionObserver === 'undefined') {
    makeVisible(el)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          makeVisible(el)
          if (options.once) {
            observer.disconnect()
            observers.delete(el)
          }
          continue
        }

        if (!options.once) {
          el.classList.remove('fly-in--visible')
        }
      }
    },
    {
      threshold: options.threshold,
      rootMargin: options.rootMargin,
    },
  )

  observers.set(el, observer)
  observer.observe(el)
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('fly', {
    beforeMount(el, binding) {
      const options = normalizeOptions(binding.value as FlyDirection | FlyOptions | undefined)
      const flyElement = el as FlyElement
      flyElement[FLY_OPTIONS_KEY] = options
      prepareElement(flyElement, options)
    },
    mounted(el, binding) {
      const flyElement = el as FlyElement
      const options = flyElement[FLY_OPTIONS_KEY] ?? normalizeOptions(binding.value as FlyDirection | FlyOptions | undefined)
      mountObserver(flyElement, options)
    },
    unmounted(el) {
      const flyElement = el as FlyElement
      cleanup(flyElement)
      delete flyElement[FLY_OPTIONS_KEY]
    },
  })
})
