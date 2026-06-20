<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";
import type { Product } from "~~/types";

const cart = useCartStore();

const props = defineProps<{
  product: Product,
  isPriority?: boolean
}>()

const imageWrapRef = ref<HTMLElement | null>(null)
const { flyToCart } = useFlyToCartAnimation()

const imageSrc = computed(() => {
  const image = props.product.image
  if (!image) {
    return null
  }

  return image.startsWith('http') || image.startsWith('/') ? image : `/${image}`
})

const productUrl = computed(() => {
  const slug = (props.product as any).slug
  return slug ? `/product/${slug}` : `/product/${props.product.id}`
})

const isImageLoading = ref(true)
const isImageError = ref(false)
const isAddedToCart = ref(false)
let addedToCartTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => imageSrc.value,
  (nextImage) => {
    isImageLoading.value = Boolean(nextImage)
    isImageError.value = false
  },
  { immediate: true },
)

const onImageLoaded = () => {
  isImageLoading.value = false
}

const onImageError = () => {
  isImageLoading.value = false
  isImageError.value = true
}

const showAddedState = () => {
  isAddedToCart.value = true

  if (addedToCartTimer) {
    clearTimeout(addedToCartTimer)
  }

  addedToCartTimer = setTimeout(() => {
    isAddedToCart.value = false
    addedToCartTimer = null
  }, 1700)
}

onBeforeUnmount(() => {
  if (addedToCartTimer) {
    clearTimeout(addedToCartTimer)
  }
})

const handleAddToCart = (event: MouseEvent) => {
  cart.addToCart(props.product)
  showAddedState()

  flyToCart({
    sourceEl: imageWrapRef.value ?? (event.currentTarget as HTMLElement | null),
    imageSrc: imageSrc.value,
  })
}
</script>

<template>
  <NuxtLink :to="productUrl" class="product-card group relative flex w-full flex-col h-full" :aria-label="product.title">
    <!-- Image frame -->
    <div ref="imageWrapRef" class="card-image relative w-full aspect-[4/5] overflow-hidden rounded-xl">
      <NuxtImg
        v-if="imageSrc && !isImageError"
        :src="imageSrc"
        :alt="product.title"
        class="card-img w-full h-full object-cover"
        :class="[ isImageLoading ? 'is-loading' : '' ]"
        width="600"
        height="750"
        format="webp"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
        :loading="isPriority ? 'eager' : 'lazy'"
        :preload="isPriority || undefined"
        :fetchpriority="isPriority ? 'high' : 'auto'"
        @load="onImageLoaded"
        @error="onImageError"
      />

      <div
        v-if="imageSrc && isImageLoading && !isImageError"
        class="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]"
      >
        <Icon icon="lucide:loader-2" height="26" class="animate-spin text-white/70" />
      </div>

      <div v-if="!imageSrc || isImageError" class="w-full h-full flex flex-col items-center justify-center text-white/20 bg-white/5">
        <Icon icon="mdi:image-off-outline" height="44" />
      </div>

      <!-- Desktop add-to-cart button -->
      <div class="card-cta absolute inset-x-0 bottom-0 p-2.5 hidden lg:flex justify-end">
        <button
          @click.prevent.stop="handleAddToCart"
          class="add-btn"
          :class="{ 'is-added': isAddedToCart }"
          :aria-label="'Přidat do košíku: ' + product.title"
        >
          <Icon :icon="isAddedToCart ? 'mdi:check-bold' : 'mdi:plus'" height="18" />
        </button>
      </div>
    </div>

    <!-- Info block -->
    <div class="card-info">
      <div class="card-info-eyebrow">— No. {{ String((product.id ?? 0)).slice(-2).padStart(2, '0') }}</div>

      <h3
        class="glitch-title card-title"
        :data-text="product.title"
      >
        {{ product.title }}
      </h3>

      <div class="card-info-bottom">
        <div class="card-price">
          <span class="psy-display price-num">{{ product.price }}</span>
          <span class="price-currency">Kč</span>
        </div>

        <button
          v-if="!isAddedToCart"
          @click.prevent.stop="handleAddToCart"
          class="lg:hidden mobile-cta"
          :aria-label="'Přidat do košíku: ' + product.title"
        >
          + Do košíku
        </button>
        <span v-else class="lg:hidden mobile-cta is-added">
          ✓ Přidáno
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.product-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.product-card:hover {
  transform: translateY(-3px);
}

/* ── Image frame ─ matted polaroid-style frame ─────── */
.card-image {
  background: #FFF5F7;
  /* Layered "matted" frame: hairline ink ring + cream mat + drop shadow */
  box-shadow:
    inset 0 0 0 1px rgba(42, 19, 64, 0.12),
    0 0 0 5px #FFF5F7,
    0 0 0 6px rgba(42, 19, 64, 0.18),
    0 8px 18px rgba(42, 19, 64, 0.14);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
}
.product-card:hover .card-image {
  box-shadow:
    inset 0 0 0 1px rgba(42, 19, 64, 0.18),
    0 0 0 5px #FFF5F7,
    0 0 0 6px var(--pop-ink, #2a1340),
    0 16px 32px rgba(42, 19, 64, 0.25);
}

.card-img {
  transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
  opacity: 1;
}
.card-img.is-loading {
  opacity: 0;
  transform: scale(1.04);
}
.product-card:hover .card-img {
  transform: scale(1.06);
}

/* Add-to-cart button (desktop) — floating pill */
.card-cta {
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.product-card:hover .card-cta {
  opacity: 1;
  transform: translateY(0);
}

.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: rgba(10, 0, 16, 0.78);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 107, 181, 0.55);
  color: #fff;
  transition: all 0.25s ease;
}
.add-btn:hover {
  background: #ff6bb5;
  border-color: #ff6bb5;
  transform: scale(1.06);
  box-shadow: 0 8px 22px rgba(255, 107, 181, 0.45);
}
.add-btn.is-added {
  background: #34d399;
  border-color: #34d399;
}

/* ── Info ──────────────────────────────────────────── */
.card-info {
  margin-top: 0.9rem;
  padding: 0 0.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex-grow: 1;
}

.card-info-eyebrow {
  font-family: var(--psy-body);
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.6);
  font-weight: 600;
}

.card-title {
  font-family: 'Petrona', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: 1.2rem;
  line-height: 1.18;
  letter-spacing: -0.005em;
  color: var(--pop-ink, #2a1340);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5em;
  transition: color 0.3s ease;
}
@media (min-width: 768px) {
  .card-title { font-size: 1.35rem; }
}

.card-info-bottom {
  margin-top: auto;
  padding-top: 0.3rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid rgba(42, 19, 64, 0.15);
}

.card-price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  padding-top: 0.45rem;
}

.price-num {
  font-family: 'Gloock', Georgia, serif;
  font-weight: 400;
  font-size: 1.8rem;
  letter-spacing: -0.02em;
  color: var(--pop-ink, #2a1340);
  line-height: 1;
}
@media (min-width: 768px) {
  .price-num { font-size: 2rem; }
}

.price-currency {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.6);
  font-weight: 600;
}

.mobile-cta {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.7);
  padding: 0.45rem 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.mobile-cta:hover { color: var(--pop-ink, #2a1340); }
.mobile-cta.is-added { color: #1f7a3a; }

/* ── Glitch hover on title (palette-tinted) ───────── */
.glitch-title {
  position: relative;
  display: inline-block;
  z-index: 1;
}
.glitch-title::before,
.glitch-title::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  visibility: hidden;
  font-family: inherit;
  font-style: inherit;
  font-weight: inherit;
  font-size: inherit;
  line-height: inherit;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.glitch-title::before {
  color: #00ffff;
  z-index: -1;
}
.glitch-title::after {
  color: #ff00ff;
  z-index: -2;
}
.product-card:hover .glitch-title::before {
  visibility: visible;
  animation: glitchy 0.3s ease 0.05s infinite;
}
.product-card:hover .glitch-title::after {
  visibility: visible;
  animation: glitchy 0.3s ease infinite reverse;
}

@keyframes glitchy {
  0%   { transform: translate(-2px, 2px); }
  25%  { transform: translate(-2px, -2px); }
  50%  { transform: translate(2px, 2px); }
  75%  { transform: translate(2px, -2px); }
  100% { transform: translate(-2px, 2px); }
}

@media (prefers-reduced-motion: reduce) {
  .product-card:hover { transform: none; }
  .product-card:hover .card-img { transform: none; }
  .product-card:hover .glitch-title::before,
  .product-card:hover .glitch-title::after { animation: none; visibility: hidden; }
}

/* Low-end devices: drop expensive effects */
:where(html.is-low-end, html.is-mid-end) .product-card:hover .card-image {
  box-shadow: none;
}
</style>
