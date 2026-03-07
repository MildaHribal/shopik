<script setup lang="ts">
import { Icon } from "@iconify/vue";
</script>

<template>
  <section class="relative w-full min-h-[60vh] md:min-h-[70vh] max-h-[85vh] flex items-center justify-center overflow-hidden">
    <!-- Cosmic animated background -->
    <div class="absolute inset-0 z-0">
      <div class="hero-gradient absolute inset-0"></div>
      <!-- Decorative floating elements — hidden on small mobile -->
      <div class="hidden sm:block absolute top-10 left-10 text-4xl hippie-float opacity-20">☮</div>
      <div class="hidden sm:block absolute top-20 right-20 text-3xl hippie-float-delayed opacity-15">🌀</div>
      <div class="hidden md:block absolute bottom-20 left-1/4 text-5xl hippie-float opacity-10">🍄</div>
      <div class="hidden sm:block absolute top-1/3 right-10 text-3xl hippie-float-delayed opacity-15">✨</div>
      <div class="hidden md:block absolute bottom-10 right-1/3 text-4xl hippie-float opacity-10">🔮</div>

      <!-- Mandala decoration — only on larger screens -->
      <div class="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 mandala-spin opacity-5">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
          <circle cx="100" cy="100" r="90" stroke="white" stroke-width="0.5"/>
          <circle cx="100" cy="100" r="70" stroke="white" stroke-width="0.5"/>
          <circle cx="100" cy="100" r="50" stroke="white" stroke-width="0.5"/>
          <circle cx="100" cy="100" r="30" stroke="white" stroke-width="0.5"/>
          <line x1="100" y1="10" x2="100" y2="190" stroke="white" stroke-width="0.3"/>
          <line x1="10" y1="100" x2="190" y2="100" stroke="white" stroke-width="0.3"/>
          <line x1="30" y1="30" x2="170" y2="170" stroke="white" stroke-width="0.3"/>
          <line x1="170" y1="30" x2="30" y2="170" stroke="white" stroke-width="0.3"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-5 md:px-6 py-12 md:py-16">
      <div class="max-w-3xl">
        <div class="cosmic-badge mb-4 md:mb-6 text-[10px] md:text-xs">
          <span>☮ Nová kolekce 2026</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 md:mb-6 leading-none tracking-tight">
          <span class="neon-text-rainbow">Trippy</span>
          <br>
          <span class="text-white neon-text">Mess</span>
        </h1>

        <p class="text-sm sm:text-base md:text-xl text-white/50 max-w-lg mb-6 md:mb-10 leading-relaxed">
          Hvězdný výběr pro osvícené duše. Ponořte se do kosmického zboží z jiné dimenze.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button class="btn-cosmic flex items-center justify-center gap-2 group text-sm md:text-lg px-6 py-3 md:px-8 md:py-4">
            <span>Prozkoumat vesmír</span>
            <Icon icon="ep:right" height="18" class="transition-transform group-hover:translate-x-1" />
          </button>
          <button class="btn-cosmic-outline flex items-center justify-center gap-2 text-sm md:text-lg px-6 py-3 md:px-8 md:py-4">
            <span>☮ Nové produkty</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom gradient fade -->
    <div class="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-[#050008] to-transparent z-10"></div>
  </section>
</template>

<style scoped>
.hero-gradient {
  background:
    radial-gradient(ellipse 80% 50% at 20% 80%, rgba(139, 92, 246, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(236, 72, 153, 0.1), transparent),
    radial-gradient(ellipse 50% 50% at 50% 50%, rgba(6, 182, 212, 0.05), transparent),
    linear-gradient(180deg, rgba(5, 0, 15, 0.3) 0%, rgba(26, 0, 53, 0.5) 50%, rgba(5, 0, 8, 0.8) 100%);
}
</style>