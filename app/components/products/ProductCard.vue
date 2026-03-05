<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";
import type { Product } from "~~/types";

const cart = useCartStore();

defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="product-card group relative flex flex-col h-full rounded-xl md:rounded-2xl p-1 md:p-1.5 transition-all duration-500">
    <!-- Gradient border effect -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/0 via-secondary-500/0 to-accent-500/0 group-hover:from-primary-500/30 group-hover:via-secondary-500/20 group-hover:to-accent-500/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>

    <div class="relative z-10 flex flex-col h-full glass-card overflow-hidden">
      <!-- Image -->
      <div class="relative w-full aspect-[3/4] overflow-hidden rounded-t-[1.1rem] bg-white/5">
        <NuxtImg
          v-if="product.image"
          :src="product.image.startsWith('http') ? product.image : `/${product.image}`"
          :alt="product.title"
          class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          width="600"
          height="800"
          format="webp"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-white/20 bg-white/5">
          <Icon icon="mdi:image-off-outline" height="48" />
        </div>

        <!-- Hover overlay with cart button -->
        <div class="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300 ease-out hidden lg:flex justify-center bg-gradient-to-t from-black/80 to-transparent">
          <button
            @click.prevent.stop="cart.addToCart(product)"
            class="flex items-center gap-2 px-5 py-2 text-sm btn-cosmic rounded-full shadow-lg transform active:scale-95"
          >
            <Icon icon="mdi:cart-plus" height="18" />
            <span>Do košíku</span>
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
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.2));
}

.product-card:hover {
  filter: drop-shadow(0 8px 30px rgba(139, 92, 246, 0.15));
}
</style>