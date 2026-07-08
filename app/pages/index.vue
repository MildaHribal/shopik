<script setup lang="ts">
import ProductCard from "~/components/products/ProductCard.vue";
import ProductCarousel from "~/components/ProductCarousel.vue";
import BigProductSlider from "~/components/BigProductSlider.vue";
import RingOrnament from "~/components/RingOrnament.vue";
import { Icon } from "@iconify/vue";
import type { Product } from '~~/types';

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || useRequestURL().origin

useSeoMeta({
  title: 'Tynky Bordel — Ruční tvorba, obrazy, klíčenky a sochy',
  description: 'Malý autorský eshop s ručně malovanými obrazy, sochami z papírmašé, klíčenkami a dalšími originály. Každý kousek je unikát. Doprava po celé ČR.',
  keywords: 'ruční tvorba, autorský eshop, obrazy, klíčenky, sochy, papírmašé, originály, umění',
  ogTitle: 'Tynky Bordel — Ruční tvorba a originály',
  ogDescription: 'Ručně malované obrazy, sochy, klíčenky. Každý kousek originál.',
  ogType: 'website',
  ogUrl: `${siteUrl}/`,
  ogImage: `${siteUrl}/hero/frog-forest-hero.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tynky Bordel — Ruční tvorba',
  twitterDescription: 'Malý autorský eshop s originály. Obrazy, sochy, klíčenky.',
  twitterImage: `${siteUrl}/hero/frog-forest-hero.png`,
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
    name: 'Tynky Bordel',
    url: siteUrl,
    description: 'Autorský eshop s ručně dělanými originály — obrazy, sochy, klíčenky.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tynky Bordel',
    url: siteUrl,
    logo: `${siteUrl}/hero/logo-mushroom.png`,
    description: 'Malý autorský eshop — ruční tvorba, originály'
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
  return [websiteSchema, orgSchema, itemListSchema];
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
        <div class="loading-eyebrow mb-4">Načítám</div>
        <div class="w-12 h-12 mx-auto rounded-full border border-[var(--pop-ink)]/15 border-t-[var(--pop-ink)] animate-spin"></div>
      </div>
    </div>

    <div v-else-if="error" class="mx-5 md:mx-12 mt-12 p-6 border border-[var(--pop-ink)]/20 rounded-3xl">
      <p class="text-lg">{{ error.message }}</p>
    </div>

    <template v-else>
      <!-- Hero: frog forest artwork -->
      <PageHero />

      <!-- Big product slider -->
      <section class="section big-slider-section" v-fly="{ direction: 'up', distance: 32 }">
        <BigProductSlider :products="featured" />
      </section>

      <!-- Best Pieces carousel -->
      <section class="section" v-fly="{ direction: 'up', distance: 32 }">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">— Výběr</div>
            <h2 class="section-title">Best Pieces</h2>
          </div>
          <div class="section-arrows">
            <button @click="carouselBest?.prev()" class="section-arrow-btn" aria-label="Předchozí">
              <Icon icon="lucide:arrow-left" height="18" />
            </button>
            <button @click="carouselBest?.next()" class="section-arrow-btn" aria-label="Další">
              <Icon icon="lucide:arrow-right" height="18" />
            </button>
          </div>
        </div>

        <ProductCarousel
          v-if="featured.length > 0"
          :products="featured"
          ref="carouselBest"
        />
      </section>

      <!-- About Me — moved from old hero -->
      <section id="about" class="section about-section" v-fly="{ direction: 'up', distance: 40 }">
        <div class="about-grid">
          <div class="about-copy">
            <div class="section-eyebrow">— O mně</div>
            <h2 class="section-title about-title">Akustická <span class="about-accent">Děvka</span>,<br />která musí furt něco tvořit</h2>
            <p class="about-desc">
              Jsem obsessed smažkama. Vytvářím jak hovna, tak absolutní bangery
              — obrazy, sochy z papírmašé, klíčenky. Každý kousek je originál,
              vyrobený rukama.
            </p>
            <p class="about-note">
              Platba zatím pouze na dobírku — krámek ještě není legal, takže pssst.
            </p>
            <div class="about-actions">
              <NuxtLink to="#kolekce" class="btn-primary">
                <span>Chci vidět vše</span>
                <Icon icon="lucide:arrow-down" height="18" />
              </NuxtLink>
              <NuxtLink to="/reklamace" class="btn-ghost">
                <span>Doprava &amp; reklamace</span>
              </NuxtLink>
            </div>
          </div>
          <div class="about-visual">
            <NuxtImg
              src="/hero/mushroom-eye.png"
              alt="Autorská ilustrace muchomůrky s okem"
              width="600"
              height="600"
              sizes="sm:100vw md:50vw lg:400px"
              format="webp"
              class="about-img"
            />
          </div>
        </div>
      </section>

      <!-- Editorial banner (mushroom-eye artwork) -->
      <section class="section banner-section" v-fly="{ direction: 'up', distance: 32 }">
        <div class="banner">
          <img
            src="/hero/mushroom-eye.png"
            alt=""
            class="banner-bg"
          />
          <div class="banner-scrim"></div>
          <RingOrnament class="banner-ring banner-ring--tl" />
          <RingOrnament class="banner-ring banner-ring--br" />

          <div class="banner-content">
            <div class="banner-eyebrow">— Jaro 2026</div>
            <h3 class="banner-title">Drobnosti, které <em>změní</em> sestavu.</h3>
            <NuxtLink to="/#kolekce" class="banner-cta">
              <span>Otevřít</span>
              <Icon icon="lucide:arrow-up-right" height="18" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Full collection grid -->
      <section id="kolekce" class="section" v-fly="{ direction: 'up', distance: 32 }">
        <div class="section-head">
          <div>
            <div class="section-eyebrow">— Katalog</div>
            <h2 class="section-title">Všechny kousky</h2>
          </div>
          <div class="section-count">
            {{ fullCollection.length }} kousků
          </div>
        </div>

        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-7">
            <ProductCard
              v-for="(prod, idx) in fullCollection"
              :key="prod.id"
              :product="prod"
              :is-priority="idx < 4"
            />
          </div>
        </div>
      </section>

      <!-- Values tiles -->
      <section class="section" v-fly="{ direction: 'up', distance: 32 }">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div class="value-tile" v-fly="{ direction: 'up', delay: 0, distance: 24 }">
            <span class="value-num">01</span>
            <Icon icon="lucide:sprout" class="value-icon" />
            <h3 class="value-title">Pečlivý výběr</h3>
            <p class="value-desc">Každý kousek schválně vybíráme. Žádné náhody, žádný balast.</p>
          </div>
          <div class="value-tile" v-fly="{ direction: 'up', delay: 100, distance: 24 }">
            <span class="value-num">02</span>
            <Icon icon="lucide:package" class="value-icon" />
            <h3 class="value-title">Z Prahy do dvou dnů</h3>
            <p class="value-desc">Balíme stejný den, posíláme přes Zásilkovnu nebo Českou poštu.</p>
          </div>
          <div class="value-tile" v-fly="{ direction: 'up', delay: 200, distance: 24 }">
            <span class="value-num">03</span>
            <Icon icon="lucide:hand-heart" class="value-icon" />
            <h3 class="value-title">Bez šidítek</h3>
            <p class="value-desc">Pokud něco nesedí, vyměníme nebo vrátíme. Bez otázek.</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.section {
  padding: 2.25rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .section { padding: 4rem 2rem; }
}
.big-slider-section {
  padding-top: 1.25rem;
  padding-bottom: 1.5rem;
}
@media (min-width: 768px) {
  .big-slider-section { padding-top: 2rem; padding-bottom: 2rem; }
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
@media (min-width: 768px) {
  .section-head { margin-bottom: 3rem; gap: 1rem; }
}

.section-eyebrow {
  font-family: 'Manrope', system-ui;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.55);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 1.85rem;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--pop-ink);
  margin: 0;
}
@media (min-width: 768px) {
  .section-title { font-size: 3.5rem; }
}

.section-count {
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-size: 1rem;
  color: rgba(42, 19, 64, 0.55);
}

.section-arrows {
  display: flex;
  gap: 0.5rem;
}
.section-arrow-btn {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 1px solid rgba(42, 19, 64, 0.18);
  background: transparent;
  color: var(--pop-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.22s ease, transform 0.22s ease, border-color 0.22s ease, color 0.22s ease;
}
@media (min-width: 768px) {
  .section-arrow-btn { width: 44px; height: 44px; }
}
.section-arrow-btn:hover {
  background: var(--pop-ink);
  color: #ffffff;
  border-color: var(--pop-ink);
  transform: translateY(-2px);
}
.section-arrow-btn:active { transform: translateY(0); }

/* ── About Me section ── */
.about-section { padding-top: 3rem; padding-bottom: 3rem; }
@media (min-width: 768px) {
  .about-section { padding-top: 5rem; padding-bottom: 5rem; }
}
.about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}
@media (min-width: 900px) {
  .about-grid { grid-template-columns: 1.2fr 1fr; gap: 4rem; }
}

.about-title {
  font-size: 1.85rem;
  margin: 0.5rem 0 1.5rem;
  line-height: 1.05;
}
@media (min-width: 768px) {
  .about-title { font-size: 3.25rem; }
}
.about-accent {
  color: #b3324c;
  font-style: italic;
  font-weight: 500;
}
.about-desc {
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: 1.2rem;
  line-height: 1.55;
  color: #1a0a30;
  margin: 0 0 1rem;
  max-width: 46ch;
}
.about-note {
  font-family: 'Manrope', system-ui;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.85);
  padding-top: 1rem;
  border-top: 1px solid rgba(42, 19, 64, 0.18);
  margin: 1.5rem 0 2rem;
  max-width: 40ch;
}
.about-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }

.btn-primary,
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 9999px;
  font-family: 'Manrope', system-ui;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;
}
.btn-primary {
  background: var(--pop-ink);
  color: #ffffff;
}
.btn-primary:hover { background: #3a1f55; transform: translateY(-1px); }
.btn-ghost {
  background: transparent;
  color: var(--pop-ink);
  border-color: rgba(42, 19, 64, 0.25);
}
.btn-ghost:hover { background: rgba(42, 19, 64, 0.06); border-color: var(--pop-ink); }

.about-visual {
  position: relative;
  display: flex;
  justify-content: center;
}
/* Phones: hide the artwork, keep just the copy. */
@media (max-width: 767px) {
  .about-visual { display: none; }
}
.about-img {
  width: 100%;
  max-width: 380px;
  height: auto;
  border-radius: 1.25rem;
  border: 1px solid rgba(42, 19, 64, 0.1);
  box-shadow: 0 12px 32px rgba(42, 19, 64, 0.14);
  background: #1a0f28;
}

/* ── Banner ── */
.banner {
  position: relative;
  border-radius: 2rem;
  overflow: hidden;
  min-height: 320px;
  background: #1a0f28;
  border: 1px solid rgba(42, 19, 64, 0.1);
}
@media (min-width: 768px) {
  .banner { min-height: 420px; border-radius: 3rem; }
}
.banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right center;
  opacity: 0.9;
}
.banner-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.1) 75%, transparent 100%),
    linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%);
}
.banner-ring { position: absolute; opacity: 0.22; mix-blend-mode: screen; }
.banner-ring--tl { top: -80px; left: -80px; }
.banner-ring--br { bottom: -80px; right: -80px; }

.banner-content {
  position: relative;
  padding: 2.5rem 2rem;
  max-width: 60%;
  color: #ffffff;
}
@media (min-width: 768px) {
  .banner-content { padding: 4rem 3rem; }
}
@media (max-width: 640px) {
  .banner-content { max-width: 100%; }
}
.banner-eyebrow {
  font-family: 'Manrope', system-ui;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--pop-pink);
  font-weight: 700;
  margin-bottom: 1rem;
}
.banner-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 1.85rem;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0 0 1.5rem;
}
@media (min-width: 768px) {
  .banner-title { font-size: 3rem; }
}
.banner-title em { font-style: italic; font-weight: 500; color: #ffcbe0; }
.banner-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  color: #ffffff;
  font-family: 'Manrope', system-ui;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}
.banner-cta:hover { background: #ffffff; color: var(--pop-ink); }

/* ── Value tiles ── */
.value-tile {
  position: relative;
  padding: 1.75rem;
  border-radius: 1.25rem;
  background: #ffffff;
  border: 1px solid rgba(42, 19, 64, 0.08);
  transition: border-color 0.3s ease, transform 0.3s ease;
}
.value-tile:hover {
  border-color: rgba(42, 19, 64, 0.25);
  transform: translateY(-3px);
}
.value-num {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  font-family: 'Fraunces', Georgia, serif;
  font-style: italic;
  font-size: 1rem;
  color: rgba(42, 19, 64, 0.35);
}
.value-icon { color: #b3324c; width: 28px; height: 28px; margin-bottom: 1.25rem; }
.value-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--pop-ink);
  margin: 0 0 0.5rem;
  letter-spacing: -0.01em;
}
.value-desc {
  font-family: 'Manrope', system-ui;
  font-weight: 500;
  font-size: 0.9rem;
  line-height: 1.55;
  color: rgba(42, 19, 64, 0.7);
  margin: 0;
}

.loading-eyebrow {
  font-family: 'Manrope', system-ui;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.55);
}
</style>
