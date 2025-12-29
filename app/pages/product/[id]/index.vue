<script setup lang="ts">
import { useCartStore } from "~/stores/cart";

const route = useRoute()
const { data: product, pending, error } = await useFetch(`/api/products/${route.params.id}`)
const cart = useCartStore()

const addToCart = () => {
  if (product.value) {
    cart.addToCart(product.value)
  }
}
</script>

<template>
  <div class="container mx-auto p-4 py-8">
    <div v-if="pending" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8 bg-red-50 rounded-lg">
      {{ error.message }}
    </div>
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div class="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
        <img
            v-if="product.image"
            :src="`/${product.image}`"
            :alt="product.title"
            class="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-500"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-gray-400">
          <span class="text-lg">No image available</span>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <div class="mb-4">
          <span class="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full">
            {{ product.category }}
          </span>
        </div>

        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ product.title }}</h1>
        <p class="text-3xl font-bold text-indigo-600 mb-6">{{ product.price }} Kč</p>

        <div class="prose prose-lg text-gray-600 mb-8">
          <p>{{ product.description }}</p>
        </div>

        <div class="border-t border-gray-200 pt-6">
          <div class="flex items-center justify-between mb-6">
             <div class="flex items-center">
               <div class="h-3 w-3 rounded-full mr-2" :class="product.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></div>
               <span class="text-sm font-medium" :class="product.stock > 0 ? 'text-green-700' : 'text-red-700'">
                 {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
               </span>
             </div>
             <span class="text-sm text-gray-500">ID: {{ product.id }}</span>
          </div>

          <button
              type="button"
              @click="addToCart"
              class="w-full flex items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-95"
              :disabled="product.stock <= 0"
              :class="{'opacity-50 cursor-not-allowed hover:bg-indigo-600': product.stock <= 0}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ product.stock > 0 ? 'Add to Cart' : 'Unavailable' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-bold text-gray-700">Product not found</h2>
      <p class="text-gray-500 mt-2">The product you are looking for does not exist.</p>
      <NuxtLink to="/" class="inline-block mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
        &larr; Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>