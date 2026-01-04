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
  <div class="group relative flex flex-col h-full transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-white/20 bg-white/5 p-2 hover:border-white/40">

    <div class="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-black/20 shadow-lg group-hover:shadow-2xl transition-shadow border border-white/10">
      <img
          v-if="product.image"
          :src="`/${product.image}`"
          :alt="product.title"
          class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      >
      <div v-else class="w-full h-full flex flex-col items-center justify-center text-white/20 bg-white/5">
        <Icon icon="mdi:image-off-outline" height="48" />
      </div>

      <div class="absolute top-3 left-3">
        <span class="px-2.5 py-1 text-xs font-bold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white rounded-md border border-white/10 shadow-sm">
          {{ product.category }}
        </span>
      </div>

      <div class="absolute inset-x-0 bottom-0 p-4 opacity-100 lg:opacity-0 lg:translate-y-full group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out flex justify-center pb-6 bg-gradient-to-t from-black/80 to-transparent">
        <button
            @click.prevent.stop="cart.addToCart(product)"
            class="flex items-center gap-1 px-4 py-2 text-sm bg-white text-[#563a79] rounded-full font-bold shadow-lg hover:bg-indigo-100 transition-colors transform active:scale-95"
        >
          <Icon icon="mdi:cart-plus" height="16" />
          <span>Do košíku</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col flex-grow pt-3 px-1">
      <h3 class="text-base font-bold text-white leading-tight mb-1 line-clamp-2 group-hover:text-indigo-200 transition-colors">
        {{ product.title }}
      </h3>

      <div class="mt-auto flex items-end justify-between">
        <div class="flex flex-col">
          <span class="text-xs text-indigo-200 font-medium">Cena</span>
          <span class="text-lg font-black text-white">{{ product.price }} Kč</span>
        </div>

        <div class="lg:hidden text-white">
          <Icon icon="mdi:arrow-right" height="24" />
        </div>
      </div>
    </div>
  </div>
</template>