<script setup lang="ts">
import ProductCard from "~/components/products/ProductCard.vue";
import ProductCarousel from "~/components/ProductCarousel.vue";
import RingOrnament from "~/components/RingOrnament.vue";
import { Icon } from "@iconify/vue";
import type { Product } from '~~/types';

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || useRequestURL().origin
useSeoMeta({
  title: 'Shopik',
  description: 'Tištěné, šité, malované. Ručně vybírané kousky pro každého, kdo si všímá detailů.',
  ogTitle: 'Shopik — viděno jinak',
  ogDescription: 'Tištěné, šité, malované. Ručně vybírané kousky pro každého, kdo si všímá detailů.',
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
  twitterCard: 'summary_large_image',
})

const { data: allProducts, pending, error } = await useFetch<Product[]>('/api/products?limit=40')

const featured = computed(() => {
  if (!allProducts.value) return [];
  return allProducts.value
    .slice(0, 10)
    .map((p, index) => ({ ...p, id: p.id || `feat-${index}` }));
});

const fullCollection = computed(() => {
  if (!allProducts.value) return [];
  return allProducts.value.map((p, index) => ({
    ...p,
    id: p.id || `col-${index}`,
  }));
});

const jsonLd = computed(() => {
  if (!allProducts.value) return [];
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Shopik',
    url: siteUrl,
    description: 'Tištěné, šité, malované. Ručně vybírané kousky pro každého, kdo si všímá detailů.'
  };
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allProducts.value.map((p, index) => ({
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
          availability: (p.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }
    }))
  };
  return [websiteSchema, itemListSchema];
});

useHead(() => ({
  htmlAttrs: { class: 'psy-grain' },
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
  script: jsonLd.value.map(schema => ({
    type: 'application/ld+json',
    innerHTML: JSON.stringify(schema)
  }))
}))

const carouselBest = ref<InstanceType<typeof ProductCarousel> | null>(null);
</script>

<template>
  <div class="w-full">
    <div v-if="pending" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="psy-mono-eyebrow mb-4 text-[var(--psy-acid)]">načítám</div>
        <div class="w-12 h-12 mx-auto rounded-full border border-[var(--psy-cream)]/15 border-t-[var(--psy-acid)] animate-spin"></div>
      </div>
    </div>

    <div v-else-if="error" class="mx-5 md:mx-12 mt-12 p-6 border border-[var(--psy-rust)]/40 rounded-3xl text-[var(--psy-cream)]">
      <p class="psy-serif text-lg">{{ error.message }}</p>
    </div>

    <template v-else>
      <!-- Hero -->
      <PageHero />

      <!-- Featured carousel -->
      <section v-fly="{ direction: 'up', distance: 40 }" class="psy-section relative">
        <div class="flex items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div class="psy-mono-eyebrow mb-2 md:mb-3">— Výběr</div>
            <h2 class="psy-display-tight keyboard-title text-[2.4rem] sm:text-5xl md:text-6xl text-[var(--psy-cream)]">
              <span v-for="(ch, i) in 'Best'" :key="'b'+i" class="key">{{ ch }}</span>
              <span class="key">&nbsp;</span>
              <span v-for="(ch, i) in 'Pieces'" :key="'p'+i" class="key psy-acid">{{ ch }}</span>
            </h2>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              @click="carouselBest?.prev()"
              class="w-11 h-11 md:w-12 md:h-12 rounded-full border border-[var(--psy-cream)]/15 text-[var(--psy-cream)]/70 hover:text-[var(--psy-ink)] hover:bg-[var(--psy-cream)] hover:border-[var(--psy-cream)] transition-all flex items-center justify-center"
              aria-label="Předchozí"
            >
              <Icon icon="lucide:arrow-left" height="18" />
            </button>
            <button
              @click="carouselBest?.next()"
              class="w-11 h-11 md:w-12 md:h-12 rounded-full border border-[var(--psy-cream)]/15 text-[var(--psy-cream)]/70 hover:text-[var(--psy-ink)] hover:bg-[var(--psy-cream)] hover:border-[var(--psy-cream)] transition-all flex items-center justify-center"
              aria-label="Další"
            >
              <Icon icon="lucide:arrow-right" height="18" />
            </button>
          </div>
        </div>

        <div class="psy-prod-hover">
          <ProductCarousel
            v-if="featured.length > 0"
            :products="featured"
            ref="carouselBest"
          />
        </div>
      </section>

      <!-- Wavy divider -->
      <div class="px-5 md:px-12">
        <div class="psy-wave-divider"></div>
      </div>

      <!-- Editorial banner -->
      <section v-fly="{ direction: 'up', distance: 30 }" class="psy-section banner-section">
        <div class="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/8 bg-black">
          <!-- Mushroom-eye artwork as background -->
          <img
            src="/hero/mushroom-eye.png"
            alt=""
            class="banner-bg absolute inset-0 w-full h-full object-cover"
          />
          <!-- Darkening scrim on left for text readability -->
          <div class="banner-scrim absolute inset-0"></div>
          <!-- Decorative rotating rings (kryo2k/xbxjGP) -->
          <RingOrnament class="banner-ring" style="top: -80px; left: -80px;" />
          <RingOrnament class="banner-ring" style="bottom: -80px; right: -80px;" />

          <div class="relative grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-8 md:p-14 lg:p-20 min-h-[320px] md:min-h-[420px]">
            <div class="md:col-span-7 banner-content">
              <div class="psy-mono-eyebrow banner-eyebrow mb-3">— Jaro 2026</div>
              <h3 class="psy-display-tight banner-title text-3xl sm:text-4xl md:text-6xl mb-4 md:mb-6">
                Drobnosti, které <span class="psy-serif italic font-normal">změní</span> sestavu.
              </h3>
              <NuxtLink to="/category/vsechny" class="psy-pill psy-pill-ghost banner-cta">
                <span>Otevřít</span>
                <Icon icon="lucide:arrow-up-right" height="18" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- Full collection grid -->
      <section id="kolekce" v-fly="{ direction: 'up', distance: 30 }" class="psy-section">
        <div class="flex items-end justify-between gap-4 mb-8 md:mb-12">
          <div>
            <div class="psy-mono-eyebrow mb-2 md:mb-3">— Katalog</div>
            <h2 class="psy-display-tight keyboard-title text-[2.4rem] sm:text-5xl md:text-6xl text-[var(--psy-cream)]">
              <span v-for="(ch, i) in 'Všechny'" :key="'v'+i" class="key">{{ ch }}</span>
              <span class="key">&nbsp;</span>
              <span v-for="(ch, i) in 'kousky'" :key="'k'+i" class="key psy-acid">{{ ch }}</span>
            </h2>
          </div>
          <div class="text-right shrink-0">
            <div class="psy-serif italic text-[var(--psy-cream)]/50 text-sm md:text-base">
              {{ fullCollection.length }} kousků
            </div>
          </div>
        </div>

        <div class="psy-prod-hover max-w-6xl mx-auto">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-7">
            <ProductCard
              v-for="(prod, idx) in fullCollection"
              :key="prod.id"
              :product="prod"
              :is-priority="idx < 4"
            />
          </div>
        </div>
      </section>

      <!-- Tiles / values -->
      <section v-fly="{ direction: 'up', distance: 30 }" class="psy-section">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div class="psy-tile">
            <span class="psy-tile-num">01</span>
            <Icon icon="lucide:sprout" class="text-[var(--psy-acid)] w-7 h-7 mb-5" />
            <h3 class="psy-display-tight text-xl text-[var(--psy-cream)] mb-2">Pečlivý výběr</h3>
            <p class="text-[var(--psy-cream)]/55 text-sm leading-relaxed">
              Každý kousek schválně vybíráme. Žádné náhody, žádný balast.
            </p>
          </div>
          <div class="psy-tile">
            <span class="psy-tile-num">02</span>
            <Icon icon="lucide:package" class="text-[var(--psy-acid)] w-7 h-7 mb-5" />
            <h3 class="psy-display-tight text-xl text-[var(--psy-cream)] mb-2">Z Prahy do dvou dnů</h3>
            <p class="text-[var(--psy-cream)]/55 text-sm leading-relaxed">
              Balíme stejný den, posíláme přes Zásilkovnu nebo Českou poštu.
            </p>
          </div>
          <div class="psy-tile">
            <span class="psy-tile-num">03</span>
            <Icon icon="lucide:hand-heart" class="text-[var(--psy-acid)] w-7 h-7 mb-5" />
            <h3 class="psy-display-tight text-xl text-[var(--psy-cream)] mb-2">Bez šidítek</h3>
            <p class="text-[var(--psy-cream)]/55 text-sm leading-relaxed">
              Pokud něco nesedí, vyměníme nebo vrátíme. Bez otázek.
            </p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* ── Keyboard press animation on section headings ──
   Each character is its own .key span and gets a unique press-down keyframe.
   Durations + dip timings differ per nth-child so the effect is irregular
   (looks like sporadic typing rather than a clean wave). */
.keyboard-title .key {
  display: inline-block;
  letter-spacing: -0.04em;
  transition: transform 0.18s ease;
  transform-origin: 50% 100%;
}

@keyframes press-a {
  0%, 30%, 45%, 100% { transform: translateY(0); }
  35% { transform: translateY(8px); }
}
@keyframes press-b {
  0%, 70%, 85%, 100% { transform: translateY(0); }
  75% { transform: translateY(9px); }
}
@keyframes press-c {
  0%, 15%, 30%, 100% { transform: translateY(0); }
  20% { transform: translateY(7px); }
}
@keyframes press-d {
  0%, 50%, 65%, 100% { transform: translateY(0); }
  55% { transform: translateY(10px); }
}
@keyframes press-e {
  0%, 25%, 40%, 100% { transform: translateY(0); }
  30% { transform: translateY(8px); }
}
@keyframes press-f {
  0%, 60%, 75%, 100% { transform: translateY(0); }
  65% { transform: translateY(7px); }
}
@keyframes press-g {
  0%, 10%, 25%, 100% { transform: translateY(0); }
  15% { transform: translateY(9px); }
}
@keyframes press-h {
  0%, 40%, 55%, 100% { transform: translateY(0); }
  45% { transform: translateY(8px); }
}

.keyboard-title .key:nth-child(8n+1) { animation: press-a 2.0s infinite; }
.keyboard-title .key:nth-child(8n+2) { animation: press-b 3.0s infinite; }
.keyboard-title .key:nth-child(8n+3) { animation: press-c 4.0s infinite; }
.keyboard-title .key:nth-child(8n+4) { animation: press-d 2.5s infinite; }
.keyboard-title .key:nth-child(8n+5) { animation: press-e 2.5s infinite; }
.keyboard-title .key:nth-child(8n+6) { animation: press-f 3.5s infinite; }
.keyboard-title .key:nth-child(8n+7) { animation: press-g 2.2s infinite; }
.keyboard-title .key:nth-child(8n+8) { animation: press-h 3.2s infinite; }

@media (prefers-reduced-motion: reduce) {
  .keyboard-title .key { animation: none !important; }
}

/* ── Editorial banner with mushroom-eye artwork ── */
.banner-section :deep(.banner-bg) {
  object-position: right center;
  opacity: 0.95;
}
.banner-section :deep(.banner-scrim) {
  background:
    linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 65%, transparent 100%),
    linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.45) 100%);
  pointer-events: none;
}
.banner-section :deep(.banner-ring) {
  mix-blend-mode: screen;
  opacity: 0.22;
}
.banner-section :deep(.banner-eyebrow) {
  color: var(--pop-pink) !important;
  opacity: 1;
}
.banner-section :deep(.banner-title) {
  color: #fff;
}
.banner-section :deep(.banner-cta) {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
}
.banner-section :deep(.banner-cta:hover) {
  background: rgba(255, 255, 255, 0.92);
  color: var(--pop-ink);
}

@media (max-width: 768px) {
  .banner-section :deep(.banner-bg) {
    object-position: 65% center;
  }
}
</style>
