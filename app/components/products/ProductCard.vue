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
  <div class="product-card group relative flex w-full max-w-full flex-col h-full rounded-xl md:rounded-2xl p-1 md:p-1.5 transition-all duration-500">
    <!-- Gradient border effect -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 via-secondary-500/0 to-accent-500/0 group-hover:from-primary-500/30 group-hover:via-secondary-500/20 group-hover:to-accent-500/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

    <div class="relative z-10 flex flex-col h-full glass-card overflow-hidden">
      <!-- Image -->
      <div ref="imageWrapRef" class="relative w-full aspect-[3/4] overflow-hidden rounded-t-[1.1rem] bg-white/5">
        <NuxtImg
          v-if="imageSrc && !isImageError"
          :src="imageSrc"
          :alt="product.title"
          class="w-full h-full object-cover transition-all duration-700 ease-out"
          :class="[
            isImageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-110',
          ]"
          width="600"
          height="800"
          format="webp"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          :loading="isPriority ? 'eager' : 'lazy'"
          :preload="isPriority || undefined"
          :fetchpriority="isPriority ? 'high' : 'auto'"
          @load="onImageLoaded"
          @error="onImageError"
        />

        <div
          v-if="imageSrc && isImageLoading && !isImageError"
          class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
        >
          <Icon icon="lucide:loader-2" height="30" class="animate-spin text-primary-300/80" />
        </div>

        <div v-if="!imageSrc || isImageError" class="w-full h-full flex flex-col items-center justify-center text-white/20 bg-white/5">
          <Icon icon="mdi:image-off-outline" height="48" />
        </div>

        <!-- Hover overlay with cart button -->
        <div class="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 ease-out hidden lg:flex justify-center bg-gradient-to-t from-black/80 to-transparent">
          <button
            @click.prevent.stop="handleAddToCart"
            class="flex items-center gap-2 px-5 py-2 text-sm rounded-full shadow-lg transform active:scale-95 transition-all duration-300"
            :class="isAddedToCart
              ? 'bg-emerald-500 text-white ring-2 ring-emerald-300/60'
              : 'btn-cosmic'"
          >
            <Icon :icon="isAddedToCart ? 'mdi:check-bold' : 'mdi:cart-plus'" height="18" />
            <span>{{ isAddedToCart ? 'Přidáno' : 'Do košíku' }}</span>
          </button>
        </div>

        <!-- Mobile Add to Cart button removed on mobile per design -->
      </div>

      <!-- Info -->
      <div class="flex flex-col flex-grow p-2.5 md:p-4">
        <h3 class="text-xs md:text-sm font-bold text-white/90 leading-tight mb-1.5 md:mb-2 line-clamp-2 group-hover:text-white transition-colors">
          {{ product.title }}
        </h3>

        <div class="mt-auto flex items-end justify-between">
          <div class="flex flex-col">
            <span class="text-[0.6rem] md:text-[0.65rem] text-primary-300/60 font-medium uppercase tracking-wider">Cena</span>
            <span class="text-base md:text-lg font-black text-white">{{ product.price }} <span class="text-[10px] md:text-sm text-white/50">Kč</span></span>
          </div>

          <div class="lg:hidden text-primary-400">
            <Icon icon="mdi:arrow-right" height="20" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  transition: transform 0.4s var(--ease-snappy), opacity 0.4s var(--ease-snappy);
  contain: paint;
}

:where(html.is-low-end, html.is-mid-end, html.is-view-transitioning) .product-card {
  filter: none !important;
  box-shadow: none !important;
}

.product-card:hover {
  filter: drop-shadow(0 8px 25px rgba(139, 92, 246, 0.2));
  transform: translateY(-4px);
}

:where(html.is-low-end, html.is-mid-end) .product-card:hover {
  transform: none !important;
}
</style>