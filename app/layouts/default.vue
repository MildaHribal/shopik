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
      <footer class="cosmic-footer mt-20 pt-16 pb-8 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
        <!-- Subtle background glow for footer -->
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-left">
            <!-- Brand Column -->
            <div class="space-y-6">
              <div class="flex items-center gap-3">
                <NuxtImg src="/logo.webp" width="40" height="40" class="rounded-lg shadow-lg shadow-primary-500/20" />
                <span class="text-2xl font-black neon-text-rainbow tracking-tighter">Shopik</span>
              </div>
              <p class="text-white/50 text-sm leading-relaxed max-w-xs">
                Vesmírný e-shop pro ty, kteří hledají víc než jen obyčejné věci. Gadgety, doplňky a zboží pro osvícenou mysl.
              </p>
              <div class="flex gap-4 text-white/30">
                <span class="hippie-float text-xl">🍄</span>
                <span class="hippie-float-delayed text-xl">🌀</span>
                <span class="hippie-float text-xl">🌌</span>
              </div>
            </div>

            <!-- Shop Links -->
            <div>
              <h3 class="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Icon icon="mdi:shopping-outline" class="text-primary-400" />
                Nakupování
              </h3>
              <ul class="space-y-4 text-sm text-white/40">
                <li><NuxtLink to="/" class="hover:text-primary-300 transition-colors flex items-center gap-2">Hlavní stránka</NuxtLink></li>
                <li><NuxtLink to="/cart" class="hover:text-primary-300 transition-colors flex items-center gap-2">Košík</NuxtLink></li>
                <li><NuxtLink to="/my-account" class="hover:text-primary-300 transition-colors flex items-center gap-2">Můj účet</NuxtLink></li>
              </ul>
            </div>

            <!-- Customer Service -->
            <div>
              <h3 class="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Icon icon="mdi:help-circle-outline" class="text-accent-400" />
                Podpora
              </h3>
              <ul class="space-y-4 text-sm text-white/40">
                <li><NuxtLink to="/reklamace" class="hover:text-accent-300 transition-colors">Doprava a reklamace</NuxtLink></li>
                <li><NuxtLink to="/obchodni-podminky" class="hover:text-accent-300 transition-colors">Obchodní podmínky</NuxtLink></li>
                <li><NuxtLink to="/ochrana-osobnich-udaju" class="hover:text-accent-300 transition-colors">Ochrana soukromí</NuxtLink></li>
              </ul>
            </div>

            <!-- Social Media Column - PROMINENT -->
            <div class="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl shadow-black/20">
              <h3 class="text-white font-bold text-lg mb-6">Sledujte nás</h3>
              <div class="grid grid-cols-1 gap-4">
                <a href="https://www.instagram.com/_kristyna_aaa/" target="_blank" rel="noopener noreferrer" 
                   class="social-card group overflow-hidden relative p-3 rounded-xl bg-gradient-to-br from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-white/10 hover:border-white/20 transition-all duration-500">
                  <div class="flex items-center gap-3">
                    <div class="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Icon icon="mdi:instagram" class="text-white text-xl" />
                    </div>
                    <div>
                      <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">Instagram</div>
                      <div class="text-sm font-bold text-white">@_kristyna_aaa</div>
                    </div>
                  </div>
                </a>

                <a href="https://www.tiktok.com/@_kristyna_aaa" target="_blank" rel="noopener noreferrer" 
                   class="social-card group overflow-hidden relative p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all duration-500">
                  <div class="flex items-center gap-3">
                    <div class="bg-white p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Icon icon="ic:baseline-tiktok" class="text-black text-xl" />
                    </div>
                    <div>
                      <div class="text-[10px] uppercase tracking-widest text-white/40 font-bold">TikTok</div>
                      <div class="text-sm font-bold text-white">@_kristyna_aaa</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="order-2 md:order-1">
              <p class="text-white/30 text-sm">© 2026 Shopik — Všechna práva vyhrazena. ✨</p>
            </div>
            
            <!-- Payment Icons -->
            <div class="order-1 md:order-2 flex flex-col items-center md:items-end gap-3">
              <span class="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black">Bezpečné platby</span>
              <div class="flex flex-wrap items-center gap-4 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
                <Icon icon="logos:visa" class="h-4 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <Icon icon="logos:mastercard" class="h-6 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <Icon icon="logos:google-pay" class="h-5 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <Icon icon="logos:apple-pay" class="h-5 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <div class="w-px h-4 bg-white/10 mx-1"></div>
                <Icon icon="mdi:shield-check-outline" class="text-green-400/50 text-lg" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.social-card {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.social-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}
</style>
