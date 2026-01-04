<script setup lang="ts">
import ProductCard from "~/components/products/ProductCard.vue";
import ProductCarousel from "~/components/ProductCarousel.vue";
import { Icon } from "@iconify/vue";
import type { Product } from '~/types/product';
import mira from '../../public/mira.jpg'


const {data: rawProducts, pending, error} = await useFetch<Product[]>('/api/products')

const productsWithIds = computed(() => {
  if (!rawProducts.value) return [];
  return rawProducts.value.map((p, index) => ({
    ...p,
    id: p.id || `${p.name.replace(/\s+/g, '-')}-${index}`
  }));
});

const categories = computed(() => {
  if (!productsWithIds.value) return []
  return [...new Set(productsWithIds.value.map(p => p.category).filter(Boolean))].sort() as string[]
})

const selectedCategory = ref<string | null>(null)

const filteredProducts = computed(() => {
  if (!productsWithIds.value) return []
  if (!selectedCategory.value) return productsWithIds.value
  return productsWithIds.value.filter(p => p.category === selectedCategory.value)
})

const carouselRef = ref<InstanceType<typeof ProductCarousel> | null>(null);
</script>

<template>
  <div class="w-full overflow-x-hidden">
    <div v-if="pending" class="text-center py-8">
      Loading...
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error.message }}
    </div>
    <template v-else>

      <PageHero/>

      <div class="py-12 text-center flex items-center justify-between px-14">
        <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Nase nejprodavanejsi vytvory🔥</h1>
        <div class="flex space-x-2">
          <button
            @click="carouselRef?.prev()"
            class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-800/75 text-white transition-colors"
            aria-label="Předchozí"
          >
            <Icon icon="ep:arrow-left-bold" height="24" />
          </button>
          <button
            @click="carouselRef?.next()"
            class="p-2 rounded-full bg-gray-800/50 hover:bg-gray-800/75 text-white transition-colors"
            aria-label="Další"
          >
            <Icon icon="ep:arrow-right-bold" height="24" />
          </button>
        </div>
      </div>

      <div class="px-12">
        <ProductCarousel
            v-if="productsWithIds && productsWithIds.length > 0"
            :products="productsWithIds"
            ref="carouselRef"
        />
      </div>

      <section class="relative w-full h-screen max-h-150 flex items-center justify-center bg-gray-900 text-white mt-15">
        <div class="absolute inset-0 z-0">
          <img
              :src="mira"
              alt="Hero Background"
              class="w-full h-full object-cover opacity-50"
          />
        </div>

        <div class="relative z-10 container mx-auto px-4 ">
          <h1 class="text-4xl font-bold mb-6">
            Nejvetsi vyber gadgetu pro fetaky v Cesku
          </h1>
          <h2 class="text-2xl">Novinka: Buchna pleskacka</h2>
          <button class="mt-5 bg-secondary-800 hover:bg-secondary-700 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-300 ease-in-out flex items-center gap-2 group">
            Prohlednout si kolekci
            <span class="transition-transform duration-300 ease-in-out group-hover:translate-x-1">
          <Icon icon="ep:right" height="24" />
        </span>
          </button>
        </div>
      </section>

        <div class="flex items-center justify-baseline m-5">
          <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Vsechny produkty</h1>
        </div>

      <div class="flex mt-8">
        <Sidebar
            :categories="categories"
            :selected-category="selectedCategory"
            @select="selectedCategory = $event"
        />
        <div class="flex-1 pl-8 mr-10">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            <NuxtLink
                v-for="product in filteredProducts"
                :key="product.id"
                :to="`/product/${product.id}`"
                class="block h-full"
            >
              <ProductCard :product="product"/>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
</style>