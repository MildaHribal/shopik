<script setup lang="ts">
import CartComponent from "~/components/products/CartComponent.vue";

useSeoMeta({
  title: 'Košík',
  description: 'Obsah vašeho nákupního košíku.',
  robots: 'noindex,nofollow',
})
</script>

<template>
  <div class="container mx-auto p-4 py-8 flex justify-center">
    <CartComponent />
  </div>
</template>

<style scoped>

</style>