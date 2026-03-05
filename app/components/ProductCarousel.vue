<script setup lang="ts">
import { ref } from 'vue';
import ProductCard from "~/components/products/ProductCard.vue";

const props = defineProps<{
  products: Array<any>;
}>();

const carouselRef = ref<HTMLElement | null>(null);


const scroll = (direction: 'next' | 'prev') => {
  if (!carouselRef.value) return;

  const scrollAmount = carouselRef.value.offsetWidth;
  const maxScrollLeft = carouselRef.value.scrollWidth - carouselRef.value.offsetWidth;

  if (direction === 'next') {
    if (carouselRef.value.scrollLeft + scrollAmount >= maxScrollLeft) {
      carouselRef.value.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carouselRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  } else {
    if (carouselRef.value.scrollLeft - scrollAmount <= 0) {
      carouselRef.value.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
    } else {
      carouselRef.value.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }
};

defineExpose({
  next: () => scroll('next'),
  prev: () => scroll('prev'),
});
</script>

<template>
  <div class="relative">
    <div
      ref="carouselRef"
      class="flex overflow-x-scroll scroll-smooth snap-x snap-mandatory hide-scrollbar"
    >
      <div
        v-for="product in products"
        :key="product.id || product.name"
        class="flex-shrink-0 w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-1.5 md:p-2 snap-start"
      >
        <NuxtLink :to="`/product/${product.id}`" class="block h-full">
          <ProductCard :product="product" class="h-full" />
        </NuxtLink>
      </div>
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