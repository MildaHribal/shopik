<script setup lang="ts">
import ProductCard from "~/components/products/ProductCard.vue";
import ProductCarousel from "~/components/ProductCarousel.vue";
import { Icon } from "@iconify/vue";
import type { Product } from '~~/types';

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || useRequestURL().origin
useSeoMeta({
  title: 'Shopik — kosmický shop',
  description: 'Kosmické zboží, gadgety a doplňky. Prohlédněte si nejprodávanější produkty a objevte nové dimenze zábavy.',
  ogTitle: 'Shopik — kosmický shop',
  ogDescription: 'Kosmické zboží, gadgety a doplňky. Prohlédněte si nejprodávanější produkty a objevte nové dimenze zábavy.',
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
  twitterCard: 'summary_large_image',
})
const { data: rawProducts, pending, error } = useLazyFetch<Product[]>('/api/products?limit=30&random=true')

// Split the random products into three distinct sliders
const bestSellers = computed(() => {
  if (!rawProducts.value) return [];
  return rawProducts.value.slice(0, 10).map((p, index) => ({
    ...p,
    id: p.id || `bs-${index}`
  }));
});

const featured = computed(() => {
  if (!rawProducts.value) return [];
  return rawProducts.value.slice(10, 20).map((p, index) => ({
    ...p,
    id: p.id || `feat-${index}`
  }));
});

const newArrivals = computed(() => {
  if (!rawProducts.value) return [];
  return rawProducts.value.slice(20, 30).map((p, index) => ({
    ...p,
    id: p.id || `new-${index}`
  }));
});

const jsonLd = computed(() => {
  if (!rawProducts.value) return [];
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shopik',
    url: siteUrl,
    description: 'Kosmické zboží, gadgety a doplňky. Prohlédněte si nejprodávanější produkty a objevte nové dimenze zábavy.'
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: rawProducts.value.map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        url: `${siteUrl}/product/${(p as any).slug || p.id}`,
        name: p.title || p.name,
        image: p.image?.startsWith('http') ? p.image : `${siteUrl}${p.image?.startsWith('/') ? '' : '/'}${p.image || ''}`,
        offers: {
          '@type': 'Offer',
          price: p.price,
          priceCurrency: 'CZK',
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }
    }))
  };

  return [websiteSchema, itemListSchema];
});

useHead(() => ({
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
  script: jsonLd.value.map(schema => ({
    type: 'application/ld+json',
    innerHTML: JSON.stringify(schema)
  }))
}))

const carouselBest = ref<InstanceType<typeof ProductCarousel> | null>(null);
const carouselFeat = ref<InstanceType<typeof ProductCarousel> | null>(null);
const carouselNew = ref<InstanceType<typeof ProductCarousel> | null>(null);

</script>

<template>
  <div class="w-full">
    <div v-if="pending" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-white/40">Načítání kosmického zboží...</p>
      </div>
    </div>
    <div v-else-if="error" class="glass-card mx-4 md:mx-8 mt-8 p-6 md:p-8 text-center">
      <p class="text-red-400 text-lg">{{ error.message }}</p>
    </div>
    <template v-else>

      <!-- Hero -->
      <div v-fly="{ direction: 'up', distance: 24, duration: 760 }">
        <PageHero />
      </div>

      <!-- Best Sellers Section -->
      <section v-fly="{ direction: 'left', distance: 56 }" class="py-10 md:py-16 px-4 md:px-14">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight neon-text">
              Naše nejprodávanější výtvory 🔥
            </h2>
            <p class="text-white/30 mt-1 md:mt-2 text-xs md:text-sm">Hvězdné kusy, které letí jako komety</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="carouselBest?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
              aria-label="Předchozí"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselBest?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
              aria-label="Další"
            >
              <Icon icon="ep:arrow-right-bold" height="18" />
            </button>
          </div>
        </div>

        <div v-fly="{ direction: 'up', delay: 80, distance: 38 }">
          <ProductCarousel
            v-if="bestSellers.length > 0"
            :products="bestSellers"
            ref="carouselBest"
          />
        </div>
      </section>

      <!-- Cosmic Divider -->
      <div class="cosmic-divider mx-4 md:mx-14"></div>

      <!-- Banner Section -->
      <section v-fly="{ direction: 'right', delay: 40, distance: 60 }" class="relative mx-4 md:mx-14 rounded-2xl md:rounded-3xl overflow-hidden my-8 md:my-10">
        <div class="relative min-h-[280px] md:h-[350px] flex items-center">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-secondary-900/30 to-accent-900/40"></div>
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

          <div class="relative z-10 px-6 md:px-16 py-8 max-w-2xl">
            <span class="cosmic-badge mb-3 md:mb-4">🍄 Novinka</span>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 neon-text-pink">
              Největší výběr gadgetů v Česku
            </h2>
            <p class="text-white/50 text-sm md:text-lg mb-5 md:mb-6">Objevte nové dimenze zábavy s naší kosmickou kolekcí</p>
            <NuxtLink to="/category/vsechny" class="btn-cosmic micro-lift inline-flex items-center gap-2 group text-sm md:text-base px-6 py-3 md:px-8 md:py-3">
              <span>Prohlédnout kolekci</span>
              <Icon icon="ep:right" height="18" class="transition-transform group-hover:translate-x-1" />
            </NuxtLink>
          </div>

          <!-- Floating decorations - hidden on very small screens -->
          <div class="hidden sm:block absolute right-10 top-10 text-5xl hippie-float opacity-20">🌌</div>
          <div class="hidden sm:block absolute right-32 bottom-10 text-4xl hippie-float-delayed opacity-15">🔮</div>
        </div>
      </section>

      <!-- Cosmic Divider -->
      <div class="cosmic-divider mx-4 md:mx-14"></div>

      <!-- Featured Section -->
      <section v-fly="{ direction: 'up', distance: 40 }" class="py-10 md:py-16 px-4 md:px-14">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight neon-text-cyan">
              Vybrané pro tebe ✨
            </h2>
            <p class="text-white/30 mt-1 md:mt-2 text-xs md:text-sm">Must-have kousky pro každou dimenzi</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="carouselFeat?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
              aria-label="Předchozí"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselFeat?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
              aria-label="Další"
            >
              <Icon icon="ep:arrow-right-bold" height="18" />
            </button>
          </div>
        </div>

        <ProductCarousel
          v-if="featured.length > 0"
          :products="featured"
          ref="carouselFeat"
        />
      </section>

      <!-- Cosmic Divider -->
      <div class="cosmic-divider mx-4 md:mx-14 opacity-50"></div>

      <!-- New Arrivals Section -->
      <section v-fly="{ direction: 'up', distance: 40 }" class="py-10 md:py-16 px-4 md:px-14">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-secondary-400">
              Absolutní novinky 🚀
            </h2>
            <p class="text-white/30 mt-1 md:mt-2 text-xs md:text-sm">Freshest kapky z jiného vesmíru</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="carouselNew?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselNew?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
            >
              <Icon icon="ep:arrow-right-bold" height="18" />
            </button>
          </div>
        </div>

        <ProductCarousel
          v-if="newArrivals.length > 0"
          :products="newArrivals"
          ref="carouselNew"
        />
      </section>

      <!-- All Products Call to action -->
      <section v-fly="{ direction: 'up', distance: 30 }" class="py-12 md:py-16 text-center px-4 flex flex-col items-center">
        <h3 class="text-2xl text-white font-bold mb-6">Chceš prozkoumat celý vesmír?</h3>
        <NuxtLink to="/category/vsechny" class="btn-cosmic micro-lift inline-flex items-center justify-center gap-3 group text-lg md:text-xl px-10 py-5">
           <span>Zobrazit všechny produkty</span>
           <Icon icon="lucide:sparkles" height="24" class="transition-transform group-hover:rotate-12 group-hover:scale-110 text-yellow-300" />
        </NuxtLink>
      </section>

      <!-- Category Showcase Banner -->
      <section class="relative mx-4 md:mx-14 rounded-2xl md:rounded-3xl overflow-hidden my-12 shadow-2xl">
        <div class="relative min-h-[300px] flex items-center justify-center text-center p-8 bg-black/60 backdrop-blur-sm border border-white/10 group">
          <div class="absolute inset-0 z-0">
             <img src="https://images.unsplash.com/photo-1603513492128-ba7bc8b4fb7c?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700" alt="Psychedelic Vibes" />
          </div>
          <div class="relative z-10 max-w-2xl">
            <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-wider uppercase drop-shadow-lg">
              Psy-Trance Kolekce
            </h2>
            <p class="text-lg md:text-xl text-white/80 mb-8 drop-shadow-md">
              Připrav se na letní festivaly. Oblečení, které reflektuje tvůj vnitřní vesmír.
            </p>
            <NuxtLink to="/category/moda" class="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary-500/50 transition-all hover:scale-105">
              Objev módu
              <Icon icon="ep:right" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Brand Philosophy / Values -->
      <section class="py-12 md:py-20 px-4 md:px-14">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div class="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-6">
              <Icon icon="lucide:leaf" class="text-primary-400 w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Eko & Udržitelně</h3>
            <p class="text-white/60">Záleží nám na Matce Zemi. Vybíráme produkty z udržitelných a šetrných materiálů.</p>
          </div>
          <div class="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mb-6">
              <Icon icon="lucide:rocket" class="text-secondary-400 w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Rychlá Teleportace</h3>
            <p class="text-white/60">Tvůj balíček odstartuje rychlostí světla. Expresní doručení na vybrané pobočky.</p>
          </div>
          <div class="glass-card p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mb-6">
              <Icon icon="lucide:heart" class="text-accent-400 w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold text-white mb-3">100% Lásky</h3>
            <p class="text-white/60">Každý produkt je pečlivě vybrán a zabalen s pozitivní energií a aurou.</p>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="relative py-16 md:py-24 overflow-hidden border-y border-white/5 bg-[#120025] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <Icon icon="lucide:mail" class="w-12 h-12 text-primary-400 mx-auto mb-6" />
          <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Komunikátor z hlubokého vesmíru 🛸
          </h2>
          <p class="text-white/60 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light">
            Přihlas se k našemu newsletteru. Žádný spam, jen zprávy o nových dimenzích produktů a slevách.
          </p>
          
          <form @submit.prevent class="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <input type="email" placeholder="Tvůj e-mail pro telepatické spojení..." required 
              class="w-full sm:flex-1 px-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:border-primary-500/50 outline-none" />
            <button type="button" class="btn-cosmic w-full sm:w-auto px-8 py-4 whitespace-nowrap">
              Odebírat
            </button>
          </form>
        </div>
      </section>

      <!-- Contact Form Section -->
      <section class="py-16 md:py-24 px-4 md:px-14 relative">
        <div class="max-w-5xl mx-auto glass-card p-8 md:p-12 flex flex-col md:flex-row gap-12 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 text-9xl text-white/5">💬</div>
          
          <div class="w-full md:w-5/12 z-10">
            <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-4 neon-text">Napiš nám na domovskou planetu</h2>
            <p class="text-white/60 mb-8">
              Máš dotaz ohledně objednávky? Hledáš konkrétní krystal? Nebo nám jen chceš poslat dobrou energii? Jsme tu pro tebe.
            </p>
            
            <div class="space-y-4">
              <div class="flex items-center gap-4 text-white/80">
                <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:map-pin" class="text-primary-400" />
                </div>
                <span>Kosmická 42, 110 00 Praha</span>
              </div>
              <div class="flex items-center gap-4 text-white/80">
                <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:phone" class="text-primary-400" />
                </div>
                <span>+420 777 888 999</span>
              </div>
              <div class="flex items-center gap-4 text-white/80">
                <div class="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                  <Icon icon="lucide:mail" class="text-primary-400" />
                </div>
                <span>hello@shopik.space</span>
              </div>
            </div>
          </div>
          
          <div class="w-full md:w-7/12 z-10">
            <form @submit.prevent class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs text-white/50 uppercase tracking-wider pl-1">Jméno</label>
                  <input type="text" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500/50 outline-none transition-colors" placeholder="Tvé pozemské jméno" required>
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-white/50 uppercase tracking-wider pl-1">E-mail</label>
                  <input type="email" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500/50 outline-none transition-colors" placeholder="Tvůj e-mail" required>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs text-white/50 uppercase tracking-wider pl-1">Zpráva</label>
                <textarea rows="4" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500/50 outline-none transition-colors resize-none" placeholder="Co máš na srdci?..." required></textarea>
              </div>
              <button type="button" class="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 mt-2">
                Odeslat zprávu
              </button>
            </form>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
</style>
