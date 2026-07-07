<script setup lang="ts">
import { Icon } from "@iconify/vue";
import type { Product } from '~~/types';

const props = defineProps<{
  products: (Product & { slug?: string; shortDescription?: string })[];
}>();

const index = ref(0);
const wrapRef = ref<HTMLElement | null>(null);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;
const isPaused = ref(false);

const current = computed(() => props.products[index.value]);

const next = () => {
  if (!props.products.length) return;
  index.value = (index.value + 1) % props.products.length;
};
const prev = () => {
  if (!props.products.length) return;
  index.value = (index.value - 1 + props.products.length) % props.products.length;
};

const goto = (i: number) => {
  if (i < 0 || i >= props.products.length) return;
  index.value = i;
};

const resolveImage = (src?: string | null) => {
  if (!src) return null;
  return src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
};

const productUrl = (p: Product & { slug?: string }) => {
  return p.slug ? `/product/${p.slug}` : `/product/${p.id}`;
};

onMounted(() => {
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) next();
  }, 6500);
});
onBeforeUnmount(() => {
  if (autoplayTimer) clearInterval(autoplayTimer);
});

defineExpose({ next, prev });
</script>

<template>
  <section
    v-if="products.length"
    class="big-slider"
    ref="wrapRef"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
    aria-roledescription="carousel"
    :aria-label="`Nejlepší kousky (${products.length})`"
  >
    <Transition name="slide-fade" mode="out-in">
      <article :key="current.id" class="slide">
        <!-- Left: full product image (contain, black bg) -->
        <NuxtLink :to="productUrl(current)" class="slide-image-link" :aria-label="`Detail produktu: ${current.title || current.name}`">
          <NuxtImg
            v-if="resolveImage(current.image)"
            :src="resolveImage(current.image)!"
            :alt="current.title || current.name"
            width="1200"
            height="1200"
            format="webp"
            quality="85"
            sizes="sm:100vw md:60vw lg:900px"
            loading="eager"
            class="slide-image"
          />
        </NuxtLink>

        <!-- Right: description card -->
        <div class="slide-side">
          <div class="slide-card">
            <div class="slide-eyebrow">— {{ current.category || 'Originál' }}</div>
            <h3 class="slide-title">{{ current.title || current.name }}</h3>
            <p v-if="current.shortDescription || current.description" class="slide-desc">
              {{ current.shortDescription || current.description }}
            </p>
            <div class="slide-meta">
              <span class="slide-price">{{ current.price }} Kč</span>
              <NuxtLink :to="productUrl(current)" class="slide-cta">
                Koupit
                <Icon icon="lucide:arrow-up-right" height="16" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </article>
    </Transition>

    <!-- Arrows -->
    <button
      v-if="products.length > 1"
      class="slide-arrow slide-arrow--prev"
      @click="prev"
      aria-label="Předchozí"
    >
      <Icon icon="lucide:chevron-left" height="22" />
    </button>
    <button
      v-if="products.length > 1"
      class="slide-arrow slide-arrow--next"
      @click="next"
      aria-label="Další"
    >
      <Icon icon="lucide:chevron-right" height="22" />
    </button>

    <!-- Dots -->
    <div v-if="products.length > 1" class="slide-dots" role="tablist">
      <button
        v-for="(_, i) in products"
        :key="i"
        class="slide-dot"
        :class="{ 'is-active': i === index }"
        @click="goto(i)"
        :aria-label="`Snímek ${i + 1}`"
        role="tab"
      ></button>
    </div>
  </section>
</template>

<style scoped>
.big-slider {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 1.75rem;
  overflow: hidden;
  background: #000000;
  box-shadow: 0 14px 40px rgba(42, 19, 64, 0.18);
  border: 1px solid rgba(42, 19, 64, 0.1);
}

.slide {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #000000;
}
@media (min-width: 768px) {
  .slide {
    grid-template-columns: 1.6fr 1fr;
    aspect-ratio: 16 / 9;
  }
}

.slide-image-link {
  position: relative;
  display: block;
  height: 100%;
  min-height: 0;
  background: #000000;
  overflow: hidden;
}
.slide-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 1.25rem;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
@media (min-width: 768px) {
  .slide-image { padding: 2rem; }
}
.slide-image-link:hover .slide-image {
  transform: scale(1.02);
}

/* Right-side description column — card sits toward the LEFT so the next arrow
   has room to breathe against the outer edge. */
.slide-side {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 1rem;
  background: #000000;
}
@media (min-width: 768px) {
  .slide-side { padding: 2rem 4rem 2rem 1rem; }
}

.slide-card {
  background: #ffffff;
  color: var(--pop-ink);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.35);
}
@media (min-width: 768px) {
  .slide-card { padding: 2rem 1.75rem 1.5rem; }
}

.slide-eyebrow {
  font-family: 'Manrope', system-ui;
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.6);
  font-weight: 700;
  margin-bottom: 0.65rem;
}

.slide-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 1.55rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--pop-ink);
  margin: 0 0 0.75rem;
}
@media (min-width: 768px) {
  .slide-title { font-size: 1.85rem; }
}

.slide-desc {
  font-family: 'Manrope', system-ui;
  font-weight: 500;
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgba(42, 19, 64, 0.78);
  margin: 0 0 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid rgba(42, 19, 64, 0.1);
  padding-top: 0.9rem;
}
.slide-price {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 1.35rem;
  color: var(--pop-ink);
  letter-spacing: -0.01em;
}
.slide-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.1rem;
  background: #1a0f28;
  color: #ffffff;
  border-radius: 9999px;
  font-family: 'Manrope', system-ui;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}
.slide-cta:hover {
  background: #2a1340;
  transform: translateY(-1px);
}

/* Arrows */
.slide-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--pop-ink);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.slide-arrow:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.05);
}
.slide-arrow--prev { left: 1.25rem; }
.slide-arrow--next { right: 1.25rem; }
@media (max-width: 768px) {
  .slide-arrow { width: 38px; height: 38px; }
  .slide-arrow--prev { left: 0.75rem; }
  .slide-arrow--next { right: 0.75rem; }
}

/* Dots — sit in a small dark pill so they stay visible on both image + card */
.slide-dots {
  position: absolute;
  bottom: 0.9rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  border-radius: 9999px;
}
.slide-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}
.slide-dot.is-active {
  background: #ffffff;
  transform: scale(1.2);
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
