<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
import { Icon } from "@iconify/vue";
</script>

<template>
  <div class="trippy-shell min-h-screen relative overflow-x-clip">
    <!-- Main content -->
    <div class="relative z-10">
      <Navbar />
      <main>
        <slot />
      </main>

      <!-- Footer -->
      <footer class="trippy-footer mt-20 pt-16 pb-8 px-5 md:px-12 border-t border-[var(--psy-cream)]/8 relative">
        <div class="max-w-7xl mx-auto relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14 text-left">
            <!-- Brand Column -->
            <div class="space-y-5">
              <div class="flex items-center gap-3">
                <img src="/hero/logo-mushroom.png" alt="" class="w-10 h-10 object-contain footer-logo" />
                <span class="psy-display-tight text-2xl text-[var(--psy-cream)] tracking-tight">Tynky Bordel</span>
              </div>
              <p class="text-[var(--psy-cream)]/55 text-sm leading-relaxed max-w-xs">
                Tištěné, šité, malované. Kousky pro ty, co si všímají detailů.
              </p>
            </div>

            <!-- Shop Links -->
            <div>
              <h3 class="psy-mono-eyebrow mb-5">— Nakupování</h3>
              <ul class="space-y-3 text-sm">
                <li><NuxtLink to="/" class="psy-link">Hlavní stránka</NuxtLink></li>
                <li><NuxtLink to="/cart" class="psy-link">Košík</NuxtLink></li>
                <li><NuxtLink to="/my-account" class="psy-link">Můj účet</NuxtLink></li>
              </ul>
            </div>

            <!-- Customer Service -->
            <div>
              <h3 class="psy-mono-eyebrow mb-5">— Podpora</h3>
              <ul class="space-y-3 text-sm">
                <li><NuxtLink to="/reklamace" class="psy-link">Doprava a reklamace</NuxtLink></li>
                <li><NuxtLink to="/obchodni-podminky" class="psy-link">Obchodní podmínky</NuxtLink></li>
                <li><NuxtLink to="/ochrana-osobnich-udaju" class="psy-link">Ochrana soukromí</NuxtLink></li>
              </ul>
            </div>

            <!-- Social Media Column -->
            <div class="psy-tile">
              <h3 class="psy-mono-eyebrow mb-5">— Sledujte nás</h3>
              <div class="space-y-3">
                <a href="https://www.instagram.com/_kristyna_aaa/" target="_blank" rel="noopener noreferrer"
                   class="social-card flex items-center gap-3 p-3 rounded-xl border border-[var(--psy-cream)]/10 bg-[var(--psy-cream)]/2 hover:bg-[var(--psy-cream)]/5 transition-all">
                  <div class="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-2 rounded-lg shadow-lg">
                    <Icon icon="mdi:instagram" class="text-white text-xl" />
                  </div>
                  <div>
                    <div class="psy-mono-eyebrow text-[9px]">Instagram</div>
                    <div class="text-sm font-medium text-[var(--psy-cream)]">@_kristyna_aaa</div>
                  </div>
                </a>

                <a href="https://www.tiktok.com/@_kristyna_aaa" target="_blank" rel="noopener noreferrer"
                   class="social-card flex items-center gap-3 p-3 rounded-xl border border-[var(--psy-cream)]/10 bg-[var(--psy-cream)]/2 hover:bg-[var(--psy-cream)]/5 transition-all">
                  <div class="bg-white p-2 rounded-lg shadow-lg">
                    <Icon icon="ic:baseline-tiktok" class="text-black text-xl" />
                  </div>
                  <div>
                    <div class="psy-mono-eyebrow text-[9px]">TikTok</div>
                    <div class="text-sm font-medium text-[var(--psy-cream)]">@_kristyna_aaa</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="pt-8 border-t border-[var(--psy-cream)]/8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="order-2 md:order-1">
              <p class="text-[var(--psy-cream)]/35 text-xs">© 2026 Shopik</p>
            </div>

            <!-- Payment Icons -->
            <div class="order-1 md:order-2 flex flex-col items-center md:items-end gap-3">
              <span class="psy-mono-eyebrow text-[9px]">— Bezpečné platby</span>
              <div class="flex flex-wrap items-center gap-4 px-4 py-2 rounded-xl border border-[var(--psy-cream)]/8">
                <Icon icon="logos:visa" class="h-4 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <Icon icon="logos:mastercard" class="h-6 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <Icon icon="logos:google-pay" class="h-5 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <Icon icon="logos:apple-pay" class="h-5 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.trippy-shell {
  background: transparent;
}

.footer-logo {
  filter: drop-shadow(0 4px 14px rgba(189, 166, 206, 0.45));
}

/* Footer — dark band against pastel page */
.trippy-footer {
  background: linear-gradient(180deg, rgba(42, 19, 64, 0.92), rgba(42, 19, 64, 1));
  color: #f6e9c1;
  backdrop-filter: blur(8px);
  --psy-cream: #f6e9c1;
}
.trippy-footer :deep(.psy-mono-eyebrow) {
  color: rgba(246, 233, 193, 0.55);
}

.social-card:hover {
  transform: translateY(-2px);
}
</style>
