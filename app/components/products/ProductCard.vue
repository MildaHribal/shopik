<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import type { Product } from "~~/types";

const cart = useCartStore();

defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="product-card border rounded-lg shadow-md overflow-hidden flex flex-col h-full  transition-all duration-300 hover:shadow-xl">
    <div class="relative overflow-hidden group h-48">
      <img
        v-if="product.image"
        :src="`/${product.image}`"
        :alt="product.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      >
      <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
        No image
      </div>
      <div class="absolute inset-0  group-hover:bg-opacity-10 transition-opacity duration-300"></div>
    </div>

    <div class="p-4 flex flex-col grow">
      <div class="mb-2">
        <span class="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
          {{ product.category }}
        </span>
      </div>

      <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">{{ product.title }}</h3>

      <div class="grow" />

      <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ product.price }} Kč</p>
        <button
          @click.prevent="cart.addToCart(product)"
          class="p-2 rounded-full  hover:bg-primary-400  hover:text-primary-900 border border-b-primary-400 transition-colors duration-200"
          title="Add to Cart"
        >
          Add To Cart
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transform: translateY(0);
}
.product-card:hover {
  transform: translateY(-5px);
}
</style>