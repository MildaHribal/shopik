<script setup lang="ts">
import { Icon } from "@iconify/vue";

// Hexagonal grid: 10 cols × 6 rows = 60 cells (as in the original pen)
const HEX_COLS = 10;
const HEX_ROWS = 6;
const hexCells = Array.from({ length: HEX_COLS * HEX_ROWS }, (_, i) => i);

// Palette mapped to the 4 triangles per cell
const triColors = ['#6a5bcd', '#da71d7', '#ff6bb5', '#ffb8c1'];

// Per-letter melt: each title line is split into letters that drip independently.
const TITLE_LINES: { text: string; wave: boolean }[] = [
  { text: 'Akustická', wave: false },
  { text: 'Děvka',     wave: true  },
];
</script>

<template>
  <section class="hero relative w-full overflow-hidden">
    <!-- SVG filters: title wave + squiggly turbulence (animated, smooth) -->
    <svg width="0" height="0" style="position: absolute; top: -1px; left: -1px;" aria-hidden="true">
      <defs>
        <filter id="title-wave">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.030" numOctaves="2" seed="3">
            <animate attributeName="baseFrequency" dur="14s" values="0.018 0.030;0.025 0.020;0.018 0.030" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="12"/>
        </filter>

        <!-- Squiggly: single filter, SMIL-animated turbulence (stable, doesn't freeze).
             CSS cycling `filter: url(#squiggly-N)` between discrete refs hangs after a few
             cycles in Chromium because the render layer caches the filter — SMIL inside
             the filter keeps the noise live. -->
        <filter id="squiggly" x="-3%" y="-3%" width="106%" height="106%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="0" result="noise">
            <animate
              attributeName="seed"
              dur="0.4s"
              values="0;1;2;3;4;0"
              repeatCount="indefinite"
              calcMode="discrete"
            />
            <animate
              attributeName="baseFrequency"
              dur="0.4s"
              values="0.020;0.022;0.020;0.022;0.020"
              repeatCount="indefinite"
              calcMode="discrete"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7"/>
        </filter>
      </defs>
    </svg>

    <!-- Hero background: animated hex grid + dark scrim -->
    <div class="hero-bg absolute inset-0 -z-10">
      <div class="hex-container">
        <svg
          v-for="i in hexCells"
          :key="i"
          class="hex-shape"
          viewBox="0 0 100 115"
          preserveAspectRatio="xMidYMin slice"
        >
          <polygon
            v-for="(c, idx) in triColors"
            :key="idx"
            points=""
            fill="none"
            :stroke="c"
            stroke-width="5"
          >
            <animate
              attributeName="points"
              repeatCount="indefinite"
              dur="9s"
              :begin="`${idx * 0.6}s`"
              from="50 57.5, 50 57.5, 50 57.5"
              to="50 -75, 175 126, -75 126"
            />
          </polygon>
        </svg>
      </div>

      <!-- Scrim for text readability -->
      <div class="hero-scrim absolute inset-0"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 max-w-7xl mx-auto px-5 md:px-12 pt-24 pb-12 md:pt-28 md:pb-16">
      <div class="max-w-3xl">
        <div class="psy-chip mb-4 md:mb-5">
          <span class="dot"></span>
          <span>Fresh picoviny</span>
        </div>

        <h1 class="psy-display title text-[3rem] sm:text-5xl md:text-[5rem] lg:text-[6rem] mb-4 md:mb-6">
          <span
            v-for="(line, lineIdx) in TITLE_LINES"
            :key="lineIdx"
            class="block title-word"
            :class="{ wave: line.wave }"
          >
            <span
              v-for="(ch, i) in line.text"
              :key="i"
              class="letter"
              :style="{ '--i': i, '--seed': (lineIdx * 7 + i) % 5 }"
            >{{ ch === ' ' ? ' ' : ch }}</span>
          </span>
        </h1>

        <div class="hero-desc-wrap max-w-xl mb-6 md:mb-7">
          <p class="psy-serif squiggly-text hero-desc">
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
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050007] via-[#050007]/80 to-transparent z-[5] pointer-events-none"></div>
  </section>
</template>

<style scoped>
.hero {
  /* Hero stays dark — restore the cream var locally so legacy classes work */
  --psy-cream: #f6e9c1;
  min-height: 52vh;
  color: var(--psy-cream);
}
@media (max-width: 640px) {
  .hero { min-height: 60vh; }
}

/* Restore eyebrow on dark hero (global rule turned it dark for pastel bg) */
.hero :deep(.psy-mono-eyebrow) {
  color: rgba(246, 233, 193, 0.6);
}

/* ── Hex grid background ───────────────────────────────── */
.hero-bg {
  background-color: #1a0028;
}

.hex-container {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(10, 200px);
  grid-template-rows: repeat(6, 230px);
  transform: translate(-3%, -4%);
}

.hex-shape {
  width: 200px;
  height: 230px;
  -webkit-clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}

/* Hex snap-together: rows 2..6 shifted (10 cols per row) */
.hex-shape:nth-child(n+11)  { transform: translate(-50%, -25%); }
.hex-shape:nth-child(n+21)  { transform: translate(0%, -50%); }
.hex-shape:nth-child(n+31)  { transform: translate(-50%, -75%); }
.hex-shape:nth-child(n+41)  { transform: translate(0%, -100%); }
.hex-shape:nth-child(n+51)  { transform: translate(-50%, -125%); }

@media (max-width: 768px) {
  .hex-container { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .hex-shape animate { display: none; }
}

.hero-scrim {
  background:
    radial-gradient(circle at 30% 50%, transparent 0%, rgba(5, 0, 7, 0.35) 60%, rgba(5, 0, 7, 0.85) 100%),
    linear-gradient(90deg, rgba(5, 0, 7, 0.78) 0%, rgba(5, 0, 7, 0.55) 35%, rgba(5, 0, 7, 0.2) 70%, transparent 100%),
    linear-gradient(180deg, rgba(5, 0, 7, 0.4) 0%, transparent 25%, transparent 70%, rgba(5, 0, 7, 0.55) 100%);
}

/* ── Title (Caprasimo — chunky retro display) ────────── */
.title {
  font-family: 'Caprasimo', Georgia, serif;
  color: #fff;
  text-shadow:
    0 2px 24px rgba(0, 0, 0, 0.6),
    0 0 70px rgba(255, 170, 184, 0.3);
  font-variation-settings: normal !important;
  letter-spacing: -0.015em !important;
  font-weight: 400;
}

.title-word {
  letter-spacing: -0.015em;
  line-height: 1.0;
  position: relative;
  color: #fff;
  /* Reserve drip space below so nothing overlaps the description. */
  padding-bottom: 0.35em;
  margin-bottom: 0.1em;
}

.title-word.wave {
  filter: url(#title-wave);
  -webkit-filter: url(#title-wave);
}

/* ── Per-letter melt: scaleY stretches downward (transform-origin: top),
   layered with an animated colored glow that cycles through the palette,
   so the drip reads as actual wax/paint flowing rather than a static stretch.
   Extra keyframe stops (0/25/50/75/100) give the curve continuity instead of
   the previous 3-point pop. ── */
.letter {
  display: inline-block;
  transform-origin: 50% 0%;
  animation:
    drip-0 9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate,
    drip-glow 6s ease-in-out infinite;
  animation-delay:
    calc(var(--i, 0) * -0.55s),
    calc(var(--i, 0) * -0.4s);
  will-change: transform, filter, text-shadow;
  -webkit-mask-image: linear-gradient(180deg, #000 76%, rgba(0, 0, 0, 0.7) 92%, transparent 100%);
          mask-image: linear-gradient(180deg, #000 76%, rgba(0, 0, 0, 0.7) 92%, transparent 100%);
}
.letter:nth-child(5n+1) { animation-name: drip-0, drip-glow; }
.letter:nth-child(5n+2) { animation-name: drip-1, drip-glow; }
.letter:nth-child(5n+3) { animation-name: drip-2, drip-glow; }
.letter:nth-child(5n+4) { animation-name: drip-3, drip-glow; }
.letter:nth-child(5n+5) { animation-name: drip-4, drip-glow; }

/* Each drip-N: smoother 5-stop curve. translateY peaks small (3-4px),
   the visible drip comes from scaleY (anchored at the top). */
@keyframes drip-0 {
  0%   { transform: scaleY(1.00) translateY(0);   filter: blur(0); }
  25%  { transform: scaleY(1.08) translateY(0.5px); filter: blur(0.15px); }
  50%  { transform: scaleY(1.18) translateY(1px); filter: blur(0.25px); }
  75%  { transform: scaleY(1.3)  translateY(2px); filter: blur(0.45px); }
  100% { transform: scaleY(1.42) translateY(3px); filter: blur(0.6px); }
}
@keyframes drip-1 {
  0%   { transform: scaleY(1.00) translateY(0);   filter: blur(0); }
  25%  { transform: scaleY(1.10) translateY(0.5px); filter: blur(0.18px); }
  50%  { transform: scaleY(1.25) translateY(2px); filter: blur(0.32px); }
  75%  { transform: scaleY(1.4)  translateY(3px); filter: blur(0.55px); }
  100% { transform: scaleY(1.55) translateY(4px); filter: blur(0.8px); }
}
@keyframes drip-2 {
  0%   { transform: scaleY(1.00) translateY(0);   filter: blur(0); }
  25%  { transform: scaleY(1.05) translateY(0.3px); filter: blur(0.1px); }
  50%  { transform: scaleY(1.12) translateY(1px); filter: blur(0.2px); }
  75%  { transform: scaleY(1.23) translateY(1.5px); filter: blur(0.38px); }
  100% { transform: scaleY(1.35) translateY(2px); filter: blur(0.55px); }
}
@keyframes drip-3 {
  0%   { transform: scaleY(1.00) translateY(0);   filter: blur(0); }
  25%  { transform: scaleY(1.10) translateY(0.5px); filter: blur(0.18px); }
  50%  { transform: scaleY(1.22) translateY(2px); filter: blur(0.32px); }
  75%  { transform: scaleY(1.36) translateY(2.5px); filter: blur(0.5px); }
  100% { transform: scaleY(1.5)  translateY(3px); filter: blur(0.7px); }
}
@keyframes drip-4 {
  0%   { transform: scaleY(1.00) translateY(0);   filter: blur(0); }
  25%  { transform: scaleY(1.07) translateY(0.5px); filter: blur(0.13px); }
  50%  { transform: scaleY(1.15) translateY(1px); filter: blur(0.25px); }
  75%  { transform: scaleY(1.28) translateY(2px); filter: blur(0.4px); }
  100% { transform: scaleY(1.45) translateY(3px); filter: blur(0.65px); }
}

/* Colored drip glow — cycles through the palette as the letter stretches.
   Two layered shadows: tight halo around the glyph + softer wide bloom that
   pools below (offset y is positive). */
@keyframes drip-glow {
  0% {
    text-shadow:
      0 0 6px rgba(255, 170, 184, 0.6),
      0 12px 22px rgba(255, 170, 184, 0.35),
      0 2px 0 rgba(0, 0, 0, 0.25);
  }
  25% {
    text-shadow:
      0 0 8px rgba(218, 113, 215, 0.6),
      0 14px 24px rgba(218, 113, 215, 0.4),
      0 2px 0 rgba(0, 0, 0, 0.25);
  }
  50% {
    text-shadow:
      0 0 10px rgba(189, 166, 206, 0.7),
      0 18px 28px rgba(189, 166, 206, 0.45),
      0 2px 0 rgba(0, 0, 0, 0.25);
  }
  75% {
    text-shadow:
      0 0 8px rgba(180, 211, 217, 0.65),
      0 14px 26px rgba(180, 211, 217, 0.4),
      0 2px 0 rgba(0, 0, 0, 0.25);
  }
  100% {
    text-shadow:
      0 0 6px rgba(255, 170, 184, 0.6),
      0 12px 22px rgba(255, 170, 184, 0.35),
      0 2px 0 rgba(0, 0, 0, 0.25);
  }
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
  font-size: 1.2rem;
  line-height: 1.32;
  letter-spacing: -0.005em;
  color: rgba(246, 233, 193, 0.96);
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.55);
}
@media (min-width: 768px) {
  .hero-desc { font-size: 1.45rem; line-height: 1.3; }
}

.hero-desc-emoji {
  font-style: normal;
  display: inline-block;
  margin-left: 0.15em;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
}

.hero-desc-note {
  position: relative;
  font-family: var(--psy-body);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 500;
  color: rgba(246, 233, 193, 0.78);
  padding: 0.7rem 0 0;
  border-top: 1px solid rgba(246, 233, 193, 0.15);
  margin-top: 0.35rem;
  max-width: 30rem;
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
  color: rgba(246, 233, 193, 0.55);
}
@media (min-width: 768px) {
  .hero-desc-aside { font-size: 1.05rem; }
}

/* ── Squiggly: single filter, animation lives inside SVG via SMIL ── */
.squiggly-text {
  filter: url('#squiggly');
  -webkit-filter: url('#squiggly');
  will-change: filter;
}

@media (prefers-reduced-motion: reduce) {
  .title.is-scrolled .title-word { filter: none; }
  .squiggly-text { filter: none; animation: none; }
}
</style>
