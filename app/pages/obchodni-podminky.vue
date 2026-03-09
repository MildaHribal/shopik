<script setup lang="ts">
import { Icon } from "@iconify/vue";

useSeoMeta({
  title: 'Obchodní podmínky | Shopik',
  description: 'Všeobecné obchodní podmínky internetového obchodu Shopik.',
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 text-white/80 leading-relaxed">
    <div class="mb-10 text-center">
      <h1 class="text-3xl md:text-5xl font-black text-white mb-4 neon-text-rainbow">Obchodní podmínky 📜</h1>
      <p class="text-white/40 italic">Poslední aktualizace: 9. března 2026</p>
    </div>

    <div class="glass-card-strong p-6 md:p-10 space-y-8">
      <section>
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon icon="mdi:info-outline" class="text-primary-400" />
          1. Úvodní ustanovení
        </h2>
        <p>
          Tyto obchodní podmínky platí pro nákup v internetovém obchodě <strong>shop.hribal.site</strong>, který provozuje 
          <strong>Kristýna Egnerová</strong>, se sídlem Kosmická 42, Plzeň, PSČ 301 00, IČO: [Doplnit po přidělení] 
          (dále jen „Prodávající“). Prodávající není plátcem DPH.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon icon="mdi:file-certificate-outline" class="text-secondary-400" />
          2. Objednávka a uzavření kupní smlouvy
        </h2>
        <ul class="list-disc list-inside space-y-2 ml-4">
          <li>Podáním objednávky kupující stvrzuje, že se seznámil s těmito podmínkami.</li>
          <li>Kupní smlouva vzniká v okamžiku potvrzení objednávky ze strany Prodávajícího e-mailem.</li>
          <li>Předmětem prodeje je ruční výroba, umění a oblečení.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon icon="mdi:currency-usd" class="text-emerald-400" />
          3. Ceny a platba
        </h2>
        <ul class="list-disc list-inside space-y-2 ml-4">
          <li>Všechny ceny na e-shopu jsou konečné.</li>
          <li>Platba probíhá online prostřednictvím platební brány <strong>Stripe</strong> (platební karty, Google Pay).</li>
          <li>Zboží je odesíláno až po připsání platby na účet prodávajícího.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon icon="mdi:truck-delivery-outline" class="text-sky-400" />
          4. Doprava a doručení
        </h2>
        <ul class="list-disc list-inside space-y-2 ml-4">
          <li>Zboží odesíláme obvykle do 2 pracovních dnů, nejpozději však do 7 dnů od zaplacení.</li>
          <li>Způsoby dopravy: <strong>Zásilkovna, Česká pošta, Balíkovna</strong>.</li>
          <li>Osobní odběr: Možný v Plzni po předchozí domluvě e-mailem.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon icon="mdi:undo-variant" class="text-orange-400" />
          5. Odstoupení od smlouvy
        </h2>
        <p class="mb-3">
          Kupující (spotřebitel) má právo odstoupit od smlouvy do <strong>14 dnů</strong> od převzetí zboží bez udání důvodu.
        </p>
        <p>
          Zboží musí být vráceno nepoužité a nepoškozené na adresu sídla. Náklady na vrácení zboží nese v tomto případě Kupující.
        </p>
      </section>
      
      <div class="cosmic-divider opacity-10"></div>
      
      <p class="text-xs text-white/30 text-center">
        Tyto podmínky jsou platné pro všechny transakce v rámci e-shopu Shopik.
      </p>
    </div>

    <div class="mt-12 text-center">
      <NuxtLink to="/" class="btn-cosmic px-8 py-3 inline-flex items-center gap-2">
        <Icon icon="mdi:arrow-left" />
        Zpět k nakupování
      </NuxtLink>
    </div>
  </div>
</template>
