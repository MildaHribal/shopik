<script setup lang="ts">
import houba from '../../public/houba.png'
import { Icon } from "@iconify/vue";


</script>
<template>
  <section class="relative w-full h-screen max-h-210 flex items-center justify-center bg-gray-900 text-white">
    <div class="absolute inset-0 z-0">
      <img
          :src="houba"
          alt="Hero Background"
          class="w-full h-full object-cover opacity-50"
      />
    </div>

    <div class="relative z-10 container mx-auto px-4 ">
      <h1 class="text-5xl md:text-7xl font-bold mb-6">
        Trippy Mess
      </h1>
      <p>Povanocni slevy na mliko</p>
      <button class="mt-5 bg-primary-800 hover:bg-primary-700 text-white font-bold py-2 px-5 rounded-lg shadow-lg transition duration-300 ease-in-out flex items-center gap-2 group">
        Chci mliko
        <span class="transition-transform duration-300 ease-in-out group-hover:translate-x-1">
          <Icon icon="ep:right" height="24" />
        </span>
      </button>
      </div>
  </section>
</template>

<style scoped>

</style>