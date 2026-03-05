<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";

const route = useRoute()
const { data: product, pending, error } = await useFetch(`/api/products/${route.params.id}`)
const cart = useCartStore()

const selectedImageIndex = ref(0)

const allImages = computed(() => {
  if (!product.value) return []
  const imgs = (product.value as any).images
  if (imgs && Array.isArray(imgs) && imgs.length > 0) {
    return imgs.map((img: string) => img.startsWith('http') ? img : `/${img}`)
  }
  if (product.value.image) {
    return [product.value.image.startsWith('http') ? product.value.image : `/${product.value.image}`]
  }
  return []
})

const selectedImage = computed(() => {
  return allImages.value[selectedImageIndex.value] || null
})

const addToCart = () => {
  if (product.value) {
    cart.addToCart(product.value)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-white/40">Načítání produktu...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card-strong p-8 md:p-12 text-center">
      <div class="text-4xl mb-4">😵</div>
      <p class="font-bold text-lg text-white mb-2">Chyba při načítání</p>
      <p class="text-white/50">{{ error.message }}</p>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="relative">
      <!-- Back button -->
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 md:mb-8 group">
        <Icon icon="ep:arrow-left-bold" height="16" class="transition-transform group-hover:-translate-x-1" />
        <span class="text-sm">Zpět na úvod</span>
      </NuxtLink>

      <div class="glass-card-strong overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">

          <!-- Image Section -->
          <div class="p-4 md:p-8 bg-white/[0.02]">
            <!-- Main Image -->
            <div class="relative w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-black/20 mb-3 md:mb-4">
              <img
                v-if="selectedImage"
                :src="selectedImage"
                :alt="product.title"
                class="h-full w-full object-cover object-center transition-all duration-500"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-white/20">
                <Icon icon="mdi:image-off-outline" height="48" />
              </div>

              <!-- Image counter -->
              <div v-if="allImages.length > 1" class="absolute bottom-3 right-3 cosmic-badge text-[10px]">
                {{ selectedImageIndex + 1 }} / {{ allImages.length }}
              </div>
            </div>

            <!-- Thumbnail Strip -->
            <div v-if="allImages.length > 1" class="flex gap-2 md:gap-3 overflow-x-auto pb-2 hide-scrollbar">
              <button
                v-for="(img, idx) in allImages"
                :key="idx"
                @click="selectedImageIndex = idx"
                class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all duration-300"
                :class="selectedImageIndex === idx
                  ? 'border-primary-500 shadow-lg shadow-primary-500/30 scale-105'
                  : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'"
              >
                <img :src="img" :alt="`${product.title} - ${idx + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Content Section -->
          <div class="flex flex-col justify-center p-5 md:p-8 lg:p-12 text-white">
            <!-- Category -->
            <div class="mb-3 md:mb-5">
              <span class="cosmic-badge">
                {{ product.category }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 md:mb-5 neon-text leading-tight">
              {{ product.title }}
            </h1>

            <!-- Price -->
            <div class="flex items-baseline gap-2 mb-5 md:mb-8">
              <span class="text-3xl md:text-4xl font-black neon-text-rainbow">{{ product.price }}</span>
              <span class="text-lg md:text-xl text-white/40">Kč</span>
            </div>

            <!-- Description -->
            <div v-if="product.description" class="text-white/50 mb-6 md:mb-10 leading-relaxed text-sm md:text-base border-l-2 border-primary-500/30 pl-4">
              <p>{{ product.description }}</p>
            </div>

            <!-- Stock & Actions -->
            <div class="border-t border-white/10 pt-5 md:pt-8">
              <div class="flex items-center justify-between mb-5 md:mb-8">
                <div class="flex items-center glass-card px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl">
                  <div
                    class="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full mr-2 md:mr-3 shadow-[0_0_10px_currentColor]"
                    :class="product.stock > 0 ? 'bg-green-400 text-green-400' : 'bg-red-500 text-red-500'"
                  ></div>
                  <span
                    class="text-xs md:text-sm font-semibold tracking-wide uppercase"
                    :class="product.stock > 0 ? 'text-green-300' : 'text-red-300'"
                  >
                    {{ product.stock > 0 ? 'Skladem' : 'Vyprodáno' }}
                  </span>
                </div>
                <span class="text-[10px] md:text-xs font-mono text-white/20 uppercase tracking-widest">ID: {{ product.id }}</span>
              </div>

              <button
                type="button"
                @click="addToCart"
                class="w-full flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 text-base md:text-lg font-bold rounded-xl md:rounded-2xl transition-all duration-300 focus:outline-none"
                :disabled="product.stock <= 0"
                :class="product.stock > 0
                  ? 'btn-cosmic'
                  : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'"
              >
                <Icon icon="mdi:cart-plus" height="22" />
                {{ product.stock > 0 ? 'Přidat do košíku' : 'Nedostupné' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="glass-card-strong p-8 md:p-12 text-center">
      <div class="text-4xl md:text-5xl mb-4">🌑</div>
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-4 neon-text">Produkt nenalezen</h2>
      <p class="text-white/40 mb-6 md:mb-8 text-sm md:text-base">Tento produkt se ztratil ve vesmíru...</p>
      <NuxtLink to="/" class="btn-cosmic-outline inline-flex items-center gap-2 text-sm md:text-base">
        <Icon icon="ep:arrow-left-bold" height="16" />
        Zpět na úvod
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>