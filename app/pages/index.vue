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
const {data: rawProducts, pending, error} = await useFetch<Product[]>('/api/products?random=true&limit=12')

const productsWithIds = computed(() => {
  if (!rawProducts.value) return [];
  return rawProducts.value.map((p, index) => ({
    ...p,
    id: p.id || `${(p.title || 'product').replace(/\s+/g, '-')}-${index}`
  }));
});

const jsonLd = computed(() => {
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
    itemListElement: productsWithIds.value.map((p, index) => ({
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

const categories = computed(() => {
  if (!productsWithIds.value) return []
  return [...new Set(productsWithIds.value.map(p => p.category).filter(Boolean))].sort() as string[]
})

const selectedCategory = ref<string | null>(null)
const showMobileFilters = ref(false)

const filteredProducts = computed(() => {
  if (!productsWithIds.value) return []
  if (!selectedCategory.value) return productsWithIds.value
  return productsWithIds.value.filter(p => p.category === selectedCategory.value)
})

const carouselRef = ref<InstanceType<typeof ProductCarousel> | null>(null);

const runWithViewTransition = (update: () => void) => {
  if (import.meta.client && typeof document.startViewTransition === 'function') {
    document.startViewTransition(update)
    return
  }

  update()
}

const selectCategory = (cat: string | null) => {
  if (selectedCategory.value === cat && !showMobileFilters.value) {
    return
  }

  runWithViewTransition(() => {
    selectedCategory.value = cat
    showMobileFilters.value = false
  })
}
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
              @click="carouselRef?.prev()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
              aria-label="Předchozí"
            >
              <Icon icon="ep:arrow-left-bold" height="18" />
            </button>
            <button
              @click="carouselRef?.next()"
              class="p-2.5 md:p-3 rounded-full glass-card text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 micro-lift"
              aria-label="Další"
            >
              <Icon icon="ep:arrow-right-bold" height="18" />
            </button>
          </div>
        </div>

        <div v-fly="{ direction: 'up', delay: 80, distance: 38 }">
          <ProductCarousel
            v-if="productsWithIds && productsWithIds.length > 0"
            :products="productsWithIds"
            ref="carouselRef"
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
            <button class="btn-cosmic micro-lift flex items-center gap-2 group text-sm md:text-base px-6 py-3 md:px-8 md:py-3">
              <span>Prohlédnout kolekci</span>
              <Icon icon="ep:right" height="18" class="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <!-- Floating decorations - hidden on very small screens -->
          <div class="hidden sm:block absolute right-10 top-10 text-5xl hippie-float opacity-20">🌌</div>
          <div class="hidden sm:block absolute right-32 bottom-10 text-4xl hippie-float-delayed opacity-15">🔮</div>
        </div>
      </section>

      <!-- Cosmic Divider -->
      <div class="cosmic-divider mx-4 md:mx-14"></div>

      <!-- All Products Section -->
      <section v-fly="{ direction: 'up', distance: 40 }" class="py-8 md:py-12 px-4 md:px-8">
        <div class="flex items-center justify-between gap-3 mb-6 md:mb-8 px-2 md:px-6">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight neon-text-cyan">
              Všechny produkty
            </h2>
            <span class="text-xl md:text-2xl hippie-float">✨</span>
          </div>

          <!-- Mobile filter button -->
          <button
            @click="showMobileFilters = !showMobileFilters"
            class="lg:hidden flex items-center gap-2 px-3 py-2 glass-card text-white/60 hover:text-white text-sm transition-all micro-lift"
          >
            <Icon icon="mdi:filter-variant" height="18" />
            <span class="hidden sm:inline">Filtry</span>
          </button>
        </div>

        <!-- Mobile category filter (collapsible) -->
        <Transition name="expand">
          <div v-if="showMobileFilters" class="lg:hidden mx-2 mb-6" v-fly="{ direction: 'down', distance: 24, duration: 600 }">
            <div class="glass-card p-4">
              <div class="flex flex-wrap gap-2">
                <button
                  @click="selectCategory(null)"
                  class="category-chip mobile-category-chip px-3 py-2 rounded-xl text-xs font-medium"
                  :class="{ 'category-chip--active': selectedCategory === null }"
                >
                  <span
                    v-if="selectedCategory === null"
                    class="category-chip__active-bg"
                    style="view-transition-name: category-pill-mobile"
                    aria-hidden="true"
                  ></span>
                  <span class="relative z-10">✨ Vše</span>
                </button>
                <button
                  v-for="category in categories"
                  :key="category"
                  @click="selectCategory(category)"
                  class="category-chip mobile-category-chip px-3 py-2 rounded-xl text-xs font-medium"
                  :class="{ 'category-chip--active': selectedCategory === category }"
                >
                  <span
                    v-if="selectedCategory === category"
                    class="category-chip__active-bg"
                    style="view-transition-name: category-pill-mobile"
                    aria-hidden="true"
                  ></span>
                  <span class="relative z-10">{{ category }}</span>
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <div class="flex mt-4">
          <!-- Desktop Sidebar -->
          <div class="hidden lg:block">
            <div v-fly="{ direction: 'left', distance: 34 }">
              <Sidebar
                :categories="categories"
                :selected-category="selectedCategory"
                @select="selectCategory"
              />
            </div>
          </div>
          <div class="flex-1 lg:pl-8 lg:pr-4">
            <TransitionGroup name="product-grid" tag="div" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              <NuxtLink
                v-for="product in filteredProducts"
                :key="product.id"
                :to="`/product/${product.slug || product.id}`"
                :prefetch="false"
                class="block h-full w-full motion-card"
                :aria-label="product.title"
              >
                <ProductCard :product="product"/>
              </NuxtLink>
            </TransitionGroup>
          </div>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}

.mobile-category-chip {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.62);
  transition:
    color 0.28s var(--ease-snappy),
    border-color 0.28s var(--ease-snappy),
    transform 0.28s var(--ease-snappy);
}

.mobile-category-chip:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.24);
}

.category-chip--active {
  color: white;
  border-color: rgba(139, 92, 246, 0.42);
}

.category-chip__active-bg {
  position: absolute;
  inset: 2px;
  border-radius: 0.62rem;
  background: linear-gradient(120deg, rgba(139, 92, 246, 0.34), rgba(236, 72, 153, 0.34));
  border: 1px solid rgba(139, 92, 246, 0.34);
  box-shadow:
    inset 0 0 24px rgba(139, 92, 246, 0.2),
    0 8px 24px rgba(75, 0, 115, 0.25);
  pointer-events: none;
  z-index: 0;
}

.product-grid-enter-active {
  transition:
    opacity 0.22s var(--ease-fluid),
    transform 0.26s var(--ease-fluid),
    filter 0.22s var(--ease-fluid);
}

.product-grid-leave-active {
  transition: opacity 0.01ms linear;
}

.product-grid-enter-from {
  opacity: 0;
  transform: translate3d(0, 8px, 0) scale(0.992);
  filter: blur(2px);
}

.product-grid-leave-to {
  opacity: 0;
}

.product-grid-move {
  transition: transform 0.3s var(--ease-snappy);
}

@media (prefers-reduced-motion: reduce) {
  .product-grid-enter-active,
  .product-grid-leave-active,
  .product-grid-move,
  .mobile-category-chip {
    transition: none !important;
  }
}
</style>
