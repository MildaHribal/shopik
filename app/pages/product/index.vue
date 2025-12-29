<script setup lang="ts">
import ProductCard from '~/components/products/ProductCard.vue'

const { data: products, pending, error } = await useFetch('/api/products')
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Products</h1>

    <div v-if="pending" class="text-center">
      Loading...
    </div>
    <div v-else-if="error" class="text-red-500 text-center">
      {{ error.message }}
    </div>
    <div v-else-if="products && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <NuxtLink
          v-for="product in products"
          :key="product.id"
          :to="`/product/${product.id}`"
          class="block h-full"
      >
        <ProductCard :product="product" />
      </NuxtLink>
    </div>
    <div v-else class="text-center text-gray-500">
      No products found.
    </div>
  </div>
</template>

<style scoped>

</style>
