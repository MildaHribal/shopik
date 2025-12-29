<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { ref, onMounted, onUnmounted } from 'vue';

const cart = useCartStore();

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="w-full flex items-center justify-between p-4 shadow-sm top-0 z-50 ">
    <div class="flex items-center">
      <NuxtLink to="/" class="text-2xl font-bold text-indigo-900">Shopik</NuxtLink>
    </div>

    <div class="flex-grow flex justify-center mx-4">
      <div class="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          class="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
        <div class="absolute left-3 top-2.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-4">
      <UButton variant="ghost" color="gray">Login</UButton>

      <NuxtLink to="/cart" class="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span v-if="cart.itemCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
          {{ cart.itemCount }}
        </span>
      </NuxtLink>
    </div>
  </div>

  <div v-if="isScrolled" class="fixed top-0 left-0 right-0 z-50 p-3 flex justify-end items-center space-x-3 transition-all duration-300 pointer-events-none">
    <button @click="scrollToTop" class="pointer-events-auto bg-secondary-300 backdrop-blur-sm shadow-md p-3 rounded-full text-black hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer" title="Search">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>

    <button class="pointer-events-auto bg-secondary-300 backdrop-blur-sm shadow-md p-3 rounded-full text-black hover:text-indigo-600 hover:bg-white transition-colors cursor-pointer" title="Login">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </button>

    <NuxtLink to="/cart" class="pointer-events-auto bg-secondary-300 backdrop-blur-sm shadow-md p-3 rounded-full relative text-black hover:text-indigo-600 hover:bg-white transition-colors" title="Cart">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
        {{ cart.itemCount }}
      </span>
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>