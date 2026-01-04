<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";
import { ref, onMounted, onUnmounted, watch } from 'vue';

const cart = useCartStore();
const isScrolled = ref(false);
const isSearchOpen = ref(false); // Stav pro otevření/zavření hledání

const navLinks = [
  { label: 'emzaci', link: '#' },
  { label: 'devky', link: '#' },
  { label: 'anime/hentai', link: '#' },
  { label: 'zviratka', link: '#' },
  { label: 'ostatni', link: '#' }
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(isSearchOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = '';
})
</script>

<template>
  <div class="w-full flex items-center justify-between p-4 top-0 z-50">
    <div class="flex items-center">
      <NuxtLink to="/" class="text-2xl font-bold text-gray-200 tracking-tight hover:text-white transition-colors">Shopik</NuxtLink>
    </div>

    <div class="flex-grow flex justify-center mx-4">
      <div class="flex items-center gap-4">
        <button
            v-for="item in navLinks"
            :key="item.label"
            class="group relative px-6 py-2.5 overflow-hidden rounded-full text-lg font-bold text-gray-300 transition-colors duration-300 hover:bg-white/10"
        >
          <span class="block transition-transform duration-300 ease-in-out group-hover:-translate-y-[175%]">
            {{ item.label }}
          </span>
          <span class="absolute inset-0 flex items-center justify-center translate-y-[175%] transition-transform duration-300 ease-in-out group-hover:translate-y-0 text-white">
            {{ item.label }}
          </span>
        </button>
      </div>
    </div>

    <div class="flex items-center space-x-6">
      <div class="flex-grow flex justify-center">
        <button @click="isSearchOpen = true" class="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
          <Icon icon="iconamoon:search-fill" height="30" />
        </button>
      </div>

      <div class="flex items-center">
        <button class="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300" title="Login">
          <Icon icon="bxs:user" height="30" />
        </button>
      </div>

      <NuxtLink to="/cart" class="relative p-1 text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
        <Icon icon="mdi:cart" height="30" />
        <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {{ cart.itemCount }}
        </span>
      </NuxtLink>
    </div>
  </div>

  <Transition name="navbar">
    <div v-if="isScrolled" class="fixed top-0 left-0 right-0 z-40 p-4 flex justify-end items-center space-x-3 pointer-events-none">
      <button @click="isSearchOpen = true" class="pointer-events-auto bg-gray-900/80 backdrop-blur shadow-xl border border-gray-700 p-3 rounded-full text-gray-200 hover:text-white hover:bg-gray-800 transition-all duration-300 cursor-pointer" title="Search">
        <Icon icon="iconamoon:search-fill" height="24" />
      </button>

      <button class="pointer-events-auto bg-gray-900/80 backdrop-blur shadow-xl border border-gray-700 p-3 rounded-full text-gray-200 hover:text-white hover:bg-gray-800 transition-all duration-300 cursor-pointer" title="Login">
        <Icon icon="bx:user" height="24" />
      </button>

      <NuxtLink to="/cart" class="pointer-events-auto bg-gray-900/80 backdrop-blur shadow-xl border border-gray-700 p-3 rounded-full relative text-gray-200 hover:text-white hover:bg-gray-800 transition-all duration-300" title="Cart">
        <Icon icon="mdi:cart-outline" height="24" />
        <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full shadow-sm">
          {{ cart.itemCount }}
        </span>
      </NuxtLink>
    </div>
  </Transition>

  <Teleport to="body">
    <Transition name="fade">
      <div
          v-if="isSearchOpen"
          @click="isSearchOpen = false"
          class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      ></div>
    </Transition>

    <Transition name="slide">
      <div
          v-if="isSearchOpen"
          class="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-gray-900 shadow-2xl border-l border-gray-800 flex flex-col"
      >
        <div class="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 class="text-xl font-bold text-white">Vyhledávání</h2>
          <button
              @click="isSearchOpen = false"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" height="24" />
          </button>
        </div>

        <div class="p-6 flex-grow">
          <!-- Input pole -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Icon icon="iconamoon:search-fill" class="text-gray-400 group-focus-within:text-indigo-400 transition-colors" height="20" />
            </div>
            <input
                type="text"
                placeholder="Co hledáte?"
                autofocus
                class="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-xl border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-500 text-lg"
            />
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.navbar-enter-active,
.navbar-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.navbar-enter-from,
.navbar-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}


.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>