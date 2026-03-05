<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
</script>

<template>
  <div class="cosmic-bg min-h-screen relative">
    <!-- Nebula glow blobs -->
    <div class="nebula-glow nebula-glow--purple"></div>
    <div class="nebula-glow nebula-glow--pink"></div>

    <!-- Main content -->
    <div class="relative z-10">
      <Navbar />
      <main>
        <slot />
      </main>

      <!-- Cosmic Footer -->
      <footer class="cosmic-footer mt-20 py-12 px-8">
        <div class="max-w-6xl mx-auto text-center">
          <p class="text-2xl font-bold neon-text-rainbow mb-3">☮ Trippy Mess ☮</p>
          <p class="text-white/40 text-sm">© 2026 Shopik — Vesmírné zboží pro osvícenou mysl ✨</p>
          <div class="flex justify-center gap-6 mt-6 text-white/30">
            <span class="hippie-float text-lg">🍄</span>
            <span class="hippie-float-delayed text-lg">🌀</span>
            <span class="hippie-float text-lg">🌌</span>
            <span class="hippie-float-delayed text-lg">☮</span>
            <span class="hippie-float text-lg">🔮</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
</style>
