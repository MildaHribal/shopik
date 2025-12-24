<script setup lang="ts">
  import ProductCard from "~/components/products/ProductCard.vue";

  const products = [
    { name: 'Stylové boty', category: 'Obuv', price: 1200, image: 'boty.png' },
    { name: 'Značkové boty', category: 'Obuv', price: 2500, image: 'boty2.png' },
    { name: 'Gate', category: 'Oblečení', price: 800, image: 'gate.png' },
    { name: 'Anime tričko', category: 'Oblečení', price: 600, image: 'anime.png' },
    { name: 'Tetovací rukáv', category: 'Doplňky', price: 450, image: 'tetko.png' },
    { name: 'Pero', category: 'Kancelář', price: 120, image: 'pero.png' },
    { name: 'Dívka', category: 'Umění', price: 1500, image: 'devka.png' },
    { name: 'Bambusový kartáček', category: 'Hygiena', price: 50, image: 'bambus.png' },
    { name: 'Chameleón', category: 'Zvířata', price: 2000, image: 'chamik.png' },
    { name: 'Komiksový sešit', category: 'Knihy', price: 150, image: 'komiks.png' },
    { name: 'Korálky', category: 'Šperky', price: 300, image: 'koralky.png' },
    { name: 'Obraz', category: 'Umění', price: 5000, image: 'obrazek.png' },
    { name: 'Mořská hvězdice', category: 'Dekorace', price: 250, image: 'hvezdice.png' },
    { name: 'Chobotnice', category: 'Hračky', price: 400, image: 'chobotnice.png' },
    // Další produkty
    { name: 'Letní sandály', category: 'Obuv', price: 950, image: 'boty.png' },
    { name: 'Sportovní tenisky', category: 'Obuv', price: 1800, image: 'boty2.png' },
    { name: 'Džínové kraťasy', category: 'Oblečení', price: 700, image: 'gate.png' },
    { name: 'Manga tričko', category: 'Oblečení', price: 550, image: 'anime.png' },
    { name: 'Luxusní pero', category: 'Kancelář', price: 500, image: 'pero.png' },
    { name: 'Portrét', category: 'Umění', price: 2000, image: 'devka.png' },
    { name: 'Ekologický set', category: 'Hygiena', price: 150, image: 'bambus.png' },
    { name: 'Plyšový chameleón', category: 'Hračky', price: 350, image: 'chamik.png' },
    { name: 'Sběratelský komiks', category: 'Knihy', price: 500, image: 'komiks.png' },
    { name: 'Náhrdelník', category: 'Šperky', price: 450, image: 'koralky.png' },
    { name: 'Abstraktní malba', category: 'Umění', price: 7500, image: 'obrazek.png' },
    { name: 'Dekorace do koupelny', category: 'Dekorace', price: 180, image: 'hvezdice.png' },
    { name: 'Plyšová chobotnice', category: 'Hračky', price: 250, image: 'chobotnice.png' },
  ]
</script>

<template>
  <div class="w-full overflow-x-hidden px-12">
    <UCarousel
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
        :autoplay="{ delay: 3000, stopOnHover: true }"
        class="w-full relative"
    >
      <div class="p-2 h-full">
        <ProductCard :product="item" class="h-full" />
      </div>
    </UCarousel>
  </div>
</template>

<style scoped>
</style>