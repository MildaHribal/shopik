<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
import { Icon } from "@iconify/vue";
</script>

<template>
  <div class="cosmic-bg min-h-screen relative">
    <!-- Nebula glow blobs -->
    <div class="nebula-glow nebula-glow--purple"></div>
    <div class="nebula-glow nebula-glow--pink"></div>
    <div class="nebula-glow nebula-glow--cyan"></div>
    <div class="nebula-glow nebula-glow--gold"></div>

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
          
          <!-- Social Links -->
          <div class="flex justify-center gap-4 my-6">
            <a href="https://www.instagram.com/_kristyna_aaa/" target="_blank" rel="noopener noreferrer" class="social-btn group">
              <Icon icon="mdi:instagram" class="text-2xl group-hover:scale-110 transition-transform" />
              <span class="sr-only">Instagram Kristyna</span>
            </a>
            <a href="https://www.instagram.com/tynky_bordel/" target="_blank" rel="noopener noreferrer" class="social-btn group">
              <Icon icon="mdi:instagram" class="text-2xl group-hover:scale-110 transition-transform" />
              <span class="sr-only">Instagram Tynky Bordel</span>
            </a>
            <a href="https://www.tiktok.com/@_kristyna_aaa" target="_blank" rel="noopener noreferrer" class="social-btn group">
              <Icon icon="ic:baseline-tiktok" class="text-2xl group-hover:scale-110 transition-transform" />
              <span class="sr-only">TikTok</span>
            </a>
          </div>

          <p class="text-white/40 text-sm">© 2026 Shopik — Vesmírné zboží pro osvícenou mysl ✨</p>
          <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-xs">
            <NuxtLink to="/obchodni-podminky" class="text-white/30 hover:text-white transition-colors">Obchodní podmínky</NuxtLink>
            <NuxtLink to="/reklamace" class="text-white/30 hover:text-white transition-colors">Doprava a reklamace</NuxtLink>
            <NuxtLink to="/ochrana-osobnich-udaju" class="text-white/30 hover:text-white transition-colors">Ochrana osobních údajů</NuxtLink>
          </div>

          <div class="flex justify-center gap-6 mt-8 text-white/30">
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
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}
</style>
