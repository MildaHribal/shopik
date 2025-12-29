<script setup lang="ts">
import { useCartStore } from "~/stores/cart";

const cart = useCartStore()
</script>

<template>
  <div class="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="p-6 bg-gray-50 border-b border-gray-100">
      <h2 class="text-2xl font-bold text-gray-800">Váš nákupní košík</h2>
    </div>

    <div v-if="cart.items.length === 0" class="p-12 text-center">
      <div class="inline-block p-4 rounded-full bg-gray-100 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p class="text-xl text-gray-500 mb-6">Váš košík je zatím prázdný.</p>
      <NuxtLink to="/" class="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
        Pokračovat v nákupu
      </NuxtLink>
    </div>

    <div v-else class="flex flex-col md:flex-row">
      <div class="flex-grow">
        <ul class="divide-y divide-gray-100">
          <li v-for="(item, index) in cart.items" :key="index" class="p-6 flex items-center hover:bg-gray-50 transition-colors">
            <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
              <img
                v-if="item.image"
                :src="`/${item.image}`"
                :alt="item.title"
                class="h-full w-full object-cover object-center"
              >
              <div v-else class="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No image</div>
            </div>

            <div class="ml-4 flex flex-1 flex-col">
              <div>
                <div class="flex justify-between text-base font-medium text-gray-900">
                  <h3>
                    <NuxtLink :to="`/product/${item.id}`" class="hover:text-indigo-600">{{ item.title }}</NuxtLink>
                  </h3>
                  <p class="ml-4">{{ item.price }} Kč</p>
                </div>
                <p class="mt-1 text-sm text-gray-500">{{ item.category }}</p>
              </div>
              <div class="flex flex-1 items-end justify-between text-sm">
                <p class="text-gray-500">Množství: 1</p>

                <div class="flex">
                  <button
                    @click="cart.removeFromCart(index)"
                    type="button"
                    class="font-medium text-red-600 hover:text-red-500 flex items-center transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Odstranit
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="md:w-1/3 bg-gray-50 p-6 border-l border-gray-100">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Souhrn objednávky</h3>

        <div class="flow-root">
          <dl class="-my-4 divide-y divide-gray-200 text-sm">
            <div class="flex items-center justify-between py-4">
              <dt class="text-gray-600">Mezisoučet</dt>
              <dd class="font-medium text-gray-900">{{ cart.totalPrice }} Kč</dd>
            </div>
            <div class="flex items-center justify-between py-4">
              <dt class="text-gray-600">Doprava</dt>
              <dd class="font-medium text-gray-900">Zdarma</dd>
            </div>
            <div class="flex items-center justify-between py-4 border-t border-gray-200">
              <dt class="text-base font-bold text-gray-900">Celkem</dt>
              <dd class="text-xl font-bold text-indigo-600">{{ cart.totalPrice }} Kč</dd>
            </div>
          </dl>
        </div>

        <div class="mt-6">
          <button
            type="button"
            class="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
          >
            Přejít k pokladně
          </button>
        </div>

        <div class="mt-6 flex justify-center text-center text-sm text-gray-500">
          <p>
            nebo
            <NuxtLink to="/" class="font-medium text-indigo-600 hover:text-indigo-500">
              Pokračovat v nákupu
              <span aria-hidden="true"> &rarr;</span>
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>