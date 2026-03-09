<script setup lang="ts">
import { Icon } from "@iconify/vue";

useSeoMeta({
  title: 'Ochrana osobních údajů | Shopik',
  description: 'Zásady zpracování osobních údajů v souladu s GDPR v internetovém obchodě Shopik.',
})

const partners = [
  { name: 'Dopravci', description: 'Zásilkovna, Česká pošta, Balíkovna (pro doručení zásilky).', icon: 'mdi:truck-fast-outline' },
  { name: 'Platební brána', description: 'Stripe (pro bezpečné zpracování vaší platby).', icon: 'mdi:stripe' },
  { name: 'Technické služby', description: 'Cloudflare (pro bezpečnost webu a zrychlení načítání).', icon: 'mdi:cloud-lock-outline' },
  { name: 'Analýza', description: 'Google Search Console (pro analýzu výkonu našeho webu).', icon: 'mdi:chart-bar' },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 text-white/80 leading-relaxed">
    <div class="mb-12 text-center">
      <h1 class="text-3xl md:text-5xl font-black text-white mb-4 neon-text-rainbow uppercase">GDPR & Soukromí 🔒</h1>
      <p class="text-white/40 italic">Ochrana vašich osobních údajů je pro nás prioritou</p>
    </div>

    <div class="glass-card-strong p-6 md:p-10 space-y-12">
      <section>
        <span class="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-bold rounded-full mb-4 border border-primary-500/30 uppercase tracking-widest">Sekce 1</span>
        <h2 class="text-2xl font-bold text-white mb-6">Správce údajů</h2>
        <div class="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-6">
          <div class="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0 border border-primary-500/20">
            <Icon icon="mdi:account-lock" height="32" class="text-primary-400" />
          </div>
          <div>
            <p class="font-bold text-white mb-1">Kristýna Egnerová</p>
            <p class="text-white/60 text-sm">Sídlo: Kosmická 42, Plzeň</p>
            <p class="text-white/60 text-sm">IČO: [Doplnit po přidělení]</p>
            <p class="text-primary-400 text-sm font-medium mt-2">hello@shopik.space</p>
          </div>
        </div>
      </section>

      <div class="cosmic-divider opacity-5"></div>

      <section>
        <span class="inline-block px-3 py-1 bg-secondary-500/20 text-secondary-400 text-xs font-bold rounded-full mb-4 border border-secondary-500/30 uppercase tracking-widest">Sekce 2</span>
        <h2 class="text-2xl font-bold text-white mb-6">Jaké údaje sbíráme?</h2>
        <p class="mb-6">
          Zpracováváme pouze údaje, které jsou nezbytné pro účely vyřízení vaší objednávky a plnění kupní smlouvy. Jedná se o:
        </p>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 bg-white/5 rounded-xl text-center border border-white/5 transition-all hover:bg-white/[0.08]" v-for="item in ['Jméno a příjmení', 'Doručovací adresa', 'E-mailová adresa', 'Telefonní číslo']" :key="item">
            <p class="text-xs font-bold text-white">{{ item }}</p>
          </div>
        </div>
      </section>

      <div class="cosmic-divider opacity-5"></div>

      <section>
        <span class="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-4 border border-emerald-500/30 uppercase tracking-widest">Sekce 3</span>
        <h2 class="text-2xl font-bold text-white mb-6">Komu údaje předáváme?</h2>
        <p class="mb-8">
          Vaše soukromí chráníme. Vaše data jsou v nezbytném rozsahu předávána těmto partnerům pro zajištění hladkého průběhu nákupu:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="partner in partners" :key="partner.name" class="p-5 bg-white/5 rounded-xl border border-white/5 flex gap-4">
            <Icon :icon="partner.icon" class="text-emerald-400 mt-1" height="24" />
            <div>
              <p class="font-bold text-white text-sm mb-1 uppercase tracking-tight">{{ partner.name }}</p>
              <p class="text-white/40 text-xs leading-relaxed">{{ partner.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="cosmic-divider opacity-5"></div>

      <section>
        <span class="inline-block px-3 py-1 bg-sky-500/20 text-sky-400 text-xs font-bold rounded-full mb-4 border border-sky-500/30 uppercase tracking-widest">Sekce 4</span>
        <h2 class="text-2xl font-bold text-white mb-4">Vaše práva</h2>
        <p class="mb-4">
          Podle GDPR máte právo na přístup ke svým údajům, na jejich opravu, výmaz ("právo být zapomenut"), omezení zpracování a právo vznést námitku. 
        </p>
        <p>
          Pokud máte k ochraně údajů jakýkoliv dotaz, napište nám na <strong class="text-sky-400">hello@shopik.space</strong>.
        </p>
      </section>
      
      <p class="p-6 bg-gradient-to-r from-primary-500/10 to-transparent border-l-2 border-primary-500 rounded-r-2xl text-xs italic text-white/40">
        Pokud se přihlásíte k odběru našeho newsletteru, budeme vám zasílat novinky o naší tvorbě. Z odběru se můžete kdykoliv odhlásit odkazem v zápatí každého e-mailu.
      </p>
    </div>

    <div class="mt-12 text-center">
      <NuxtLink to="/" class="btn-cosmic px-8 py-3 inline-flex items-center gap-2">
        <Icon icon="mdi:arrow-left" />
        Zpět na hlavní stranu
      </NuxtLink>
    </div>
  </div>
</template>
