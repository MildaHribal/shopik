interface FlyToCartOptions {
  sourceEl: HTMLElement | null
  imageSrc?: string | null
  durationMs?: number
}

const getVisibleCartAnchors = () => {
  const anchors = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-anchor="true"]'))

  return anchors.filter((anchor) => {
    const rect = anchor.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return false
    }

    if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) {
      return false
    }

    const style = window.getComputedStyle(anchor)
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
  })
}

const findBestCartAnchor = () => {
  const visibleAnchors = getVisibleCartAnchors()
  if (!visibleAnchors.length) {
    return null
  }

  const scoreAnchor = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    // Smaller score means the element is closer to top-right.
    return rect.top + (window.innerWidth - rect.right)
  }

  return visibleAnchors.sort((a, b) => scoreAnchor(a) - scoreAnchor(b))[0] ?? null
}

const pulseCartAnchor = (anchor: HTMLElement) => {
  if (typeof anchor.animate !== 'function') {
    return
  }

  anchor.animate(
    [
      { transform: 'scale(1)', filter: 'brightness(1)' },
      { transform: 'scale(1.16)', filter: 'brightness(1.2)' },
      { transform: 'scale(1)', filter: 'brightness(1)' },
    ],
    {
      duration: 330,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  )
}

export const useFlyToCartAnimation = () => {
  const flyToCart = ({ sourceEl, imageSrc, durationMs = 780 }: FlyToCartOptions) => {
    if (import.meta.server || !sourceEl) {
      return false
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false
    }

    const cartAnchor = findBestCartAnchor()
    if (!cartAnchor) {
      return false
    }

    const startRect = sourceEl.getBoundingClientRect()
    const endRect = cartAnchor.getBoundingClientRect()

    const startSize = Math.max(42, Math.min(startRect.width, startRect.height) * 0.36)
    const endSize = Math.max(14, Math.min(endRect.width, endRect.height) * 0.3)
    const startX = startRect.left + startRect.width / 2 - startSize / 2
    const startY = startRect.top + startRect.height / 2 - startSize / 2
    const endX = endRect.left + endRect.width / 2 - endSize / 2
    const endY = endRect.top + endRect.height / 2 - endSize / 2

    const ghost = document.createElement('div')
    ghost.style.position = 'fixed'
    ghost.style.left = `${startX}px`
    ghost.style.top = `${startY}px`
    ghost.style.width = `${startSize}px`
    ghost.style.height = `${startSize}px`
    ghost.style.borderRadius = '12px'
    ghost.style.overflow = 'hidden'
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '9999'
    ghost.style.boxShadow = '0 10px 26px rgba(0, 0, 0, 0.35), 0 0 28px rgba(139, 92, 246, 0.28)'
    ghost.style.border = '1px solid rgba(255, 255, 255, 0.18)'
    ghost.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.9))'

    if (imageSrc) {
      const safeSrc = imageSrc.replace(/"/g, '\\"')
      ghost.style.background = `center / cover no-repeat url("${safeSrc}")`
    }

    const gloss = document.createElement('div')
    gloss.style.position = 'absolute'
    gloss.style.inset = '0'
    gloss.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0))'
    ghost.appendChild(gloss)

    document.body.appendChild(ghost)

    const deltaX = endX - startX
    const deltaY = endY - startY
    const arcY = Math.min(startY, endY) - Math.max(86, Math.abs(deltaY) * 0.3)
    const midX = startX + deltaX * 0.58

    const animation = ghost.animate(
      [
        {
          transform: 'translate3d(0px, 0px, 0px) scale(1) rotate(0deg)',
          opacity: 0.98,
        },
        {
          transform: `translate3d(${midX - startX}px, ${arcY - startY}px, 0px) scale(0.82) rotate(-8deg)`,
          opacity: 0.94,
          offset: 0.55,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0px) scale(0.24) rotate(9deg)`,
          opacity: 0.18,
        },
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      },
    )

    animation.onfinish = () => {
      ghost.remove()
      pulseCartAnchor(cartAnchor)
    }

    animation.oncancel = () => {
      ghost.remove()
    }

    return true
  }

  return { flyToCart }
}
