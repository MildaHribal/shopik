<script setup lang="ts">
import ProductCard from "~/components/products/ProductCard.vue";
import ProductCarousel from "~/components/ProductCarousel.vue";
import { Icon } from "@iconify/vue";
import type { Product } from '~~/types';

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || useRequestURL().origin
useSeoMeta({
  title: 'Shopik — Autorská tvorba a ruční výroba',
  description: 'Prohlédněte si jedinečné kousky oblečení, obrazů a doplňků, které tvořím s láskou a pečlivostí. Objevte krásu ruční výroby.',
  ogTitle: 'Shopik — Autorská tvorba a ruční výroba',
  ogDescription: 'Prohlédněte si jedinečné kousky oblečení, obrazů a doplňků, které tvořím s láskou a pečlivostí. Objevte krásu ruční výroby.',
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
  twitterCard: 'summary_large_image',
})
const { data: rawProducts, pending, error } = await useFetch<Product[]>('/api/products?limit=30&random=true')

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
    description: 'Prohlédněte si jedinečné kousky oblečení, obrazů a doplňků, které tvořím s láskou a pečlivostí. Objevte krásu ruční výroby.'
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
          availability: (p.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
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
  <div class="w-full overflow-x-hidden">
    <div v-if="pending" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-white/40">Načítání mých výtvorů...</p>
      </div>
    </div>
    <div v-else-if="error" class="glass-card mx-4 md:mx-8 mt-8 p-6 md:p-8 text-center">
      <p class="text-red-400 text-lg">{{ error.message }}</p>
    </div>
    <template v-else>

      <!-- Hero -->
      <PageHero/>

      <!-- Best Sellers Section -->
      <section class="py-10 md:py-16 px-4 md:px-14">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight neon-text">
              Nejžádanější kousky z mé dílny 🤍
            </h2>
            <p class="text-white/30 mt-1 md:mt-2 text-xs md:text-sm">To, co si zamilujete nejvíce</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="carouselBest?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label="Předchozí"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselBest?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label="Další"
            >
              <Icon icon="ep:arrow-right-bold" height="18" />
            </button>
          </div>
        </div>

        <ProductCarousel
          v-if="bestSellers.length > 0"
          :products="bestSellers"
          ref="carouselBest"
        />
      </section>

      <!-- Cosmic Divider -->
      <div class="cosmic-divider mx-4 md:mx-14"></div>

      <!-- Banner Section -->
      <section class="relative mx-4 md:mx-14 rounded-2xl md:rounded-3xl overflow-hidden my-8 md:my-10">
        <div class="relative min-h-[280px] md:h-[350px] flex items-center">
          <div class="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-secondary-900/30 to-accent-900/40"></div>
          <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

          <div class="relative z-10 px-6 md:px-16 py-8 max-w-2xl">
            <span class="cosmic-badge mb-3 md:mb-4">✨ Originály</span>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 neon-text-pink">
              Autorská tvorba a ruční výroba
            </h2>
            <p class="text-white/50 text-sm md:text-lg mb-5 md:mb-6">Prohlédněte si jedinečné spojení umění, módy a lásky k detailu. Každý kus tvořím s respektem k řemeslu.</p>
            <NuxtLink to="/category/vsechny" class="btn-cosmic inline-flex items-center gap-2 group text-sm md:text-base px-6 py-3 md:px-8 md:py-3">
              <span>Prohlédnout kolekci</span>
              <Icon icon="ep:right" height="18" class="transition-transform group-hover:translate-x-1" />
            </NuxtLink>
          </div>

          <!-- Floating decorations - hidden on very small screens -->
          <div class="hidden sm:block absolute right-10 top-10 text-5xl hippie-float opacity-20">🤍</div>
          <div class="hidden sm:block absolute right-32 bottom-10 text-4xl hippie-float-delayed opacity-15">🎨</div>
        </div>
      </section>

      <!-- Cosmic Divider -->
      <div class="cosmic-divider mx-4 md:mx-14"></div>

      <!-- Featured Section -->
      <section class="py-10 md:py-16 px-4 md:px-14">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight neon-text-cyan">
              Můj osobní výběr 🎨
            </h2>
            <p class="text-white/30 mt-1 md:mt-2 text-xs md:text-sm">Výběr toho nejlepšího z mé aktuální tvorby</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="carouselFeat?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label="Předchozí"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselFeat?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
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
      <section class="py-10 md:py-16 px-4 md:px-14">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-secondary-400">
              Právě dokončeno ✨
            </h2>
            <p class="text-white/30 mt-1 md:mt-2 text-xs md:text-sm">Nejnovější přírůstky z mé dílny</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="carouselNew?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselNew?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300"
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
      
      <!-- Brand Philosophy -->
      <section class="py-12 md:py-20 px-4 md:px-14">
        <div class="glass-card flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 md:gap-16 relative overflow-hidden">
          <div class="absolute -top-32 -left-32 w-64 h-64 bg-primary-500/20 blur-3xl rounded-full"></div>
          
          <div class="w-full md:w-1/2 flex justify-center z-10">
            <div class="relative w-full max-w-[450px]">
              <div class="absolute inset-0 bg-secondary-500/20 blur-2xl rounded-3xl transform rotate-6"></div>
              <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop" alt="Cosmic Vibe" class="relative z-10 w-full h-[300px] md:h-[400px] object-cover rounded-3xl -rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl border border-white/10" />
              <!-- Deco elements -->
              <div class="absolute -bottom-6 -right-6 glass-card p-4 rounded-2xl flex items-center gap-3 z-20 animate-bounce-slow">
                <span class="text-3xl">✨</span>
                <div>
                  <div class="text-white font-bold text-sm">Originální tvorba</div>
                  <div class="text-primary-300 text-xs">S láskou</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="w-full md:w-1/2 space-y-6 z-10">
            <span class="cosmic-badge text-sm">Příběh za mým uměním 🤍</span>
            <h2 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight neon-text-pink">
              Spojuji módu s láskou k ruční tvorbě
            </h2>
            <p class="text-white/60 text-lg leading-relaxed">
              Věřím, že každý kus oblečení či doplňku by měl mít svůj příběh. Veškeré zboží zde tvořím vlastníma rukama, s pečlivostí a vášní. Od obrazů, přes šperky až po oblečení — chci, abyste se v mé tvorbě cítili výjimečně.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div class="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div class="bg-primary-500/20 p-3 rounded-xl shrink-0"><Icon icon="lucide:leaf" class="text-primary-400 w-6 h-6" /></div>
                <div>
                  <h4 class="text-white font-bold mb-1">Eko & Udržitelně</h4>
                  <p class="text-white/40 text-sm">Matka Země nám poděkuje.</p>
                </div>
              </div>
              <div class="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div class="bg-secondary-500/20 p-3 rounded-xl shrink-0"><Icon icon="lucide:truck" class="text-secondary-400 w-6 h-6" /></div>
                <div>
                  <h4 class="text-white font-bold mb-1">Pečlivě zabalené balíčky</h4>
                  <p class="text-white/40 text-sm">Rychlé doručení balíčků.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="relative py-16 md:py-24 overflow-hidden border-y border-white/5 bg-[#120025] mt-12 mb-8 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
        <!-- Background Elements -->
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 hidden md:block"></div>
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50 pointer-events-none"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-[100px] mix-blend-screen opacity-50 pointer-events-none"></div>

        <div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div class="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <Icon icon="lucide:mail" class="w-10 h-10 text-primary-400" />
          </div>
          <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Novinky z mého ateliéru 💌
          </h2>
          <p class="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light">
            Zanechte mi e-mail a občas vám pošlu zprávu o nových kolekcích a tvůrčím procesu.
          </p>
          
          <form @submit.prevent class="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <div class="relative w-full sm:flex-1">
              <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Icon icon="lucide:at-sign" class="text-white/40 w-5 h-5" />
              </div>
              <input type="email" placeholder="Tvůj e-mail..." required 
                class="w-full pl-12 pr-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium" />
            </div>
            <button type="button" class="btn-cosmic w-full sm:w-auto px-8 py-4 whitespace-nowrap shadow-lg shadow-primary-500/20">
              Přihlásit k odběru
            </button>
          </form>
          <p class="text-white/30 text-xs mt-6 uppercase tracking-widest font-bold">Z odběru se můžete kdykoliv odhlásit</p>
        </div>
      </section>

      <!-- All Products Call to action -->
      <section class="py-16 md:py-24 text-center px-4 flex flex-col items-center">
        <h3 class="text-2xl lg:text-3xl text-white font-extrabold mb-8 neon-text">Kompletní nabídka z mé tvorby</h3>
        <NuxtLink to="/category/vsechny" class="btn-cosmic inline-flex items-center justify-center gap-3 group text-lg md:text-xl px-12 py-5 shadow-xl shadow-primary-500/30">
           <span>Prozkoumat celý obchod</span>
           <Icon icon="lucide:sparkles" height="24" class="transition-transform group-hover:rotate-12 group-hover:scale-110 text-yellow-300" />
        </NuxtLink>
      </section>

    </template>
  </div>
</template>

<style scoped>

</style>
