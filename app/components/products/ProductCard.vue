<script setup lang="ts">
defineProps({
  product: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="product-card border rounded-lg shadow-md overflow-hidden flex flex-col h-full bg-white dark:bg-gray-800">
    <img :src="`/${product.image}`" alt="Product Image" class="w-full h-48 object-cover">
    <div class="p-4 flex flex-col flex-grow">
      <h3 class="text-lg font-semibold">{{ product.name }}</h3>
      <p class="text-gray-500 dark:text-gray-400">{{ product.category }}</p>
      <div class="flex-grow" />
      <div class="flex items-baseline justify-between mt-4">
        <p class="text-xl font-bold">{{ product.price }} Kč</p>
        <UButton>Add to Cart</UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
}
</style>