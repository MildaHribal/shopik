<script setup lang="ts">
import { Icon } from "@iconify/vue";
</script>

<template>
  <section class="hero relative w-full overflow-hidden">
    <!-- Hero background: static frog image + dark scrim -->
    <div class="hero-bg absolute inset-0 -z-10">
      <NuxtImg
        src="/hero/frog-bg.webp"
        alt=""
        width="2000"
        height="1500"
        sizes="100vw md:100vw lg:100vw"
        format="webp"
        quality="78"
        loading="eager"
        fetchpriority="high"
        preload
        class="hero-img"
      />
      <div class="hero-scrim absolute inset-0"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-12 pt-20 pb-10 md:pt-28 md:pb-16">
      <div class="max-w-3xl">
        <div class="psy-chip mb-4 md:mb-5">
          <span class="dot"></span>
          <span>Fresh picoviny</span>
        </div>

        <h1 class="psy-display title text-[3rem] sm:text-5xl md:text-[5rem] lg:text-[6rem] mb-4 md:mb-6">
          <span class="block">Akustická</span>
          <span class="block psy-acid">Děvka</span>
        </h1>

        <div class="hero-desc-wrap max-w-xl mb-6 md:mb-7">
          <p class="psy-serif hero-desc">
            která musí furt něco tvořit
            a je obsessed smažkama. Vytvářím jak hovna,
            tak absolutní bangery <span class="hero-desc-emoji">😎🤙</span>
          </p>
          <p class="hero-desc-note">
            Platba zatím pouze na dobírku
            <span class="hero-desc-aside">(shopik ještě není legal, takže pssst <span class="hero-desc-emoji">🤫</span>)</span>
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
          <NuxtLink to="#kolekce" class="psy-pill psy-pill-ghost">
            <span>Chci vidět vše</span>
            <Icon icon="lucide:arrow-down" height="18" />
          </NuxtLink>
        </div>
      </div>

      <!-- Meta strip at bottom -->
      <div class="hidden md:flex items-center justify-between mt-8 pt-4 border-t border-[var(--psy-cream)]/15">
        <div class="psy-mono-eyebrow text-[var(--psy-cream)]/80">No. 01 — pica</div>
        <div class="psy-serif italic text-sm text-[var(--psy-cream)]/80 max-w-[24ch] text-right drop-shadow-md">
          „Je v pohodě bejt divnej."
        </div>
      </div>
    </div>

    <!-- Bottom fade for smooth transition -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050007] via-[#050007]/85 to-transparent z-[5] pointer-events-none"></div>
  </section>
</template>

<style scoped>
.hero {
  --psy-cream: #f6e9c1;
  min-height: 56vh;
  color: var(--psy-cream);
}
@media (max-width: 640px) {
  .hero { min-height: 64vh; }
}

.hero :deep(.psy-mono-eyebrow) {
  color: rgba(246, 233, 193, 0.7);
}

.hero-bg {
  background-color: #1a0028;
}

.hero-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Scrim for text readability — heavier on the left/top where text sits */
.hero-scrim {
  background:
    radial-gradient(ellipse at 25% 45%, rgba(5, 0, 7, 0.55) 0%, rgba(5, 0, 7, 0.25) 45%, transparent 75%),
    linear-gradient(90deg, rgba(5, 0, 7, 0.7) 0%, rgba(5, 0, 7, 0.45) 40%, rgba(5, 0, 7, 0.15) 75%, transparent 100%),
    linear-gradient(180deg, rgba(5, 0, 7, 0.5) 0%, transparent 30%, transparent 65%, rgba(5, 0, 7, 0.6) 100%);
}

/* ── Title (Caprasimo — chunky retro display) ────────── */
.title {
  font-family: 'Caprasimo', Georgia, serif;
  color: #fff;
  text-shadow:
    0 2px 18px rgba(0, 0, 0, 0.85),
    0 0 60px rgba(0, 0, 0, 0.5);
  letter-spacing: -0.015em;
  line-height: 1.0;
  font-weight: 400;
}

.title .psy-acid {
  color: var(--psy-acid, #d6ff3a);
}

/* ── Hero description block (Petrona) ───────────────── */
.hero-desc-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.hero-desc {
  font-family: 'Petrona', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 1.15rem;
  line-height: 1.4;
  letter-spacing: -0.005em;
  color: rgba(246, 233, 193, 0.97);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.75), 0 0 22px rgba(0, 0, 0, 0.55);
}
@media (min-width: 768px) {
  .hero-desc { font-size: 1.45rem; line-height: 1.32; }
}

.hero-desc-emoji {
  font-style: normal;
  display: inline-block;
  margin-left: 0.15em;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
}

.hero-desc-note {
  position: relative;
  font-family: var(--psy-body);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
  color: rgba(246, 233, 193, 0.88);
  padding: 0.7rem 0 0;
  border-top: 1px solid rgba(246, 233, 193, 0.2);
  margin-top: 0.35rem;
  max-width: 30rem;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.7);
}
@media (min-width: 768px) {
  .hero-desc-note { font-size: 0.82rem; }
}

.hero-desc-aside {
  display: block;
  margin-top: 0.3rem;
  font-family: var(--psy-serif);
  font-style: italic;
  text-transform: none;
  letter-spacing: -0.005em;
  font-size: 0.95rem;
  color: rgba(246, 233, 193, 0.7);
}
@media (min-width: 768px) {
  .hero-desc-aside { font-size: 1.05rem; }
}
</style>
