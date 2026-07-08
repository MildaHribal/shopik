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

// When navigating back, product images are already in the browser cache, so the
// <img> is `complete` before Vue attaches the @load listener and the load event
// never fires — leaving the image stuck at opacity:0. Detect that on mount.
onMounted(async () => {
  await nextTick()
  const img = imageWrapRef.value?.querySelector('img') as HTMLImageElement | null
  if (img?.complete) {
    if (img.naturalWidth > 0) isImageLoading.value = false
    else onImageError()
  }
})

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
        width="500"
        height="625"
        format="webp"
        quality="72"
        sizes="sm:50vw md:33vw lg:25vw xl:20vw"
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

      <h3 class="card-title">
        {{ product.title }}
      </h3>

      <!-- Add-to-cart on the card is desktop-only (the hover pill over the image).
           On mobile the whole card links to the product detail. -->
      <div class="card-info-bottom">
        <div class="card-price">
          <span class="psy-display price-num">{{ product.price }}</span>
          <span class="price-currency">Kč</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.product-card {
  text-decoration: none;
  color: inherit;
  background: #1a0f28;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 0.55rem 0.55rem 0.6rem;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.3s ease;
  box-shadow: 0 6px 18px rgba(20, 8, 36, 0.28);
}
.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 107, 181, 0.35);
  box-shadow: 0 18px 36px rgba(20, 8, 36, 0.4);
}

/* ── Image frame ── black so the product photos (shot on black) blend in, like
   the slider. ── */
.card-image {
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0.75rem;
  transition: border-color 0.3s ease;
}
.product-card:hover .card-image {
  border-color: rgba(255, 255, 255, 0.16);
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
  margin-top: 0.55rem;
  padding: 0 0.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex-grow: 1;
}

.card-info-eyebrow {
  font-family: var(--psy-body);
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.card-title {
  font-family: 'Petrona', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: 1.15rem;
  line-height: 1.2;
  letter-spacing: -0.005em;
  color: #ffffff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.3em;
}
@media (min-width: 768px) {
  .card-title { font-size: 1.22rem; }
}
/* Phones: tighter card so the image dominates; show the title (not the number),
   price underneath, no add button. */
@media (max-width: 639px) {
  .product-card { padding: 0.3rem 0.3rem 0.55rem; border-radius: 0.85rem; }
  .card-info { margin-top: 0.5rem; gap: 0.25rem; padding: 0 0.1rem; }
  .card-info-eyebrow { display: none; }
  .card-title {
    font-size: 0.95rem;
    line-height: 1.22;
    min-height: 0;
    -webkit-line-clamp: 2;
  }
  .card-info-bottom { padding-top: 0.35rem; }
}

.card-info-bottom {
  margin-top: auto;
  padding-top: 0.3rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  font-size: 1.75rem;
  letter-spacing: -0.02em;
  color: #ffffff;
  line-height: 1;
}
@media (min-width: 768px) {
  .price-num { font-size: 1.85rem; }
}

.price-currency {
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.mobile-cta {
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.45rem 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}
.mobile-cta:hover { color: #ffffff; }
.mobile-cta.is-added { color: #7ee0a1; }

@media (prefers-reduced-motion: reduce) {
  .product-card:hover { transform: none; }
  .product-card:hover .card-img { transform: none; }
}
</style>
