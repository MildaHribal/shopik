<script setup lang="ts">
  import ProductCard from "~/components/products/ProductCard.vue";
  import Sidebar from "~/components/Sidebar.vue";

  const { data: products, pending, error } = await useFetch('/api/products')

  const categories = computed(() => {
    if (!products.value) return []
    return [...new Set(products.value.map(p => p.category).filter(Boolean))].sort() as string[]
  })

  const selectedCategory = ref<string | null>(null)

  const filteredProducts = computed(() => {
    if (!products.value) return []
    if (!selectedCategory.value) return products.value
    return products.value.filter(p => p.category === selectedCategory.value)
  })
</script>

<template>
  <div class="w-full overflow-x-hidden px-12">
    <div v-if="pending" class="text-center py-8">
      Loading...
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error.message }}
    </div>
    <template v-else>
      <UCarousel
          v-if="products && products.length > 0"
          v-slot="{ item }"
          :items="products"
          :ui="{
            item: 'basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5',
            container: 'py-8',
            arrows: {
              prev: 'absolute top-1/2 left-2 transform -translate-y-1/2 z-50 bg-gray-800/50 hover:bg-gray-800/75 rounded-full p-2 text-white flex items-center justify-center',
              next: 'absolute top-1/2 right-2 transform -translate-y-1/2 z-50 bg-gray-800/50 hover:bg-gray-800/75 rounded-full p-2 text-white flex items-center justify-center'
            }
          }"
          arrows
          loop
          :autoplay="{ delay: 5000, stopOnHover: true }"
          class="w-full relative"
      >
        <div class="p-2 h-full">
          <NuxtLink :to="`/product/${item.id}`" class="block h-full">
            <ProductCard :product="item" class="h-full" />
          </NuxtLink>
        </div>
      </UCarousel>

      <div class="flex mt-8">
        <Sidebar
          :categories="categories"
          :selected-category="selectedCategory"
          @select="selectedCategory = $event"
        />

        <div class="flex-1 pl-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <NuxtLink
                v-for="product in filteredProducts"
                :key="product.id"
                :to="`/product/${product.id}`"
                class="block h-full"
            >
              <ProductCard :product="product" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
</style>