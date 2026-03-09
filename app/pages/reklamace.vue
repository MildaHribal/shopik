<script setup lang="ts">
import { Icon } from "@iconify/vue";

useSeoMeta({
  title: 'Doprava a reklamace | Shopik',
  description: 'Informace o přepravě a Postup pro vrácení zboží a reklamace v e-shopu Shopik.',
})

const shippingMethods = [
  { name: 'Zásilkovna', price: '79 Kč', icon: 'mdi:package-variant-closed' },
  { name: 'Česká pošta', price: '99 Kč', icon: 'mdi:email-outline' },
  { name: 'Balíkovna', price: '69 Kč', icon: 'mdi:mailbox' },
  { name: 'Osobní odběr (Plzeň)', price: 'Zdarma', icon: 'mdi:store-marker-outline' },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20 text-white/80 leading-relaxed">
    <div class="mb-10 text-center">
      <h1 class="text-3xl md:text-5xl font-black text-white mb-4 neon-text-rainbow uppercase">Reklamace & Doprava 📦</h1>
      <p class="text-white/40 italic">Vracení, výměna a doprava zboží</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <!-- Shipping Info -->
      <div class="glass-card-strong p-6 md:p-8 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-6 border border-primary-500/30">
          <Icon icon="mdi:truck-fast-outline" height="32" class="text-primary-400" />
        </div>
        <h2 class="text-xl font-bold text-white mb-4">Doprava</h2>
        <p class="text-sm mb-6">Zboží odesíláme do 2–7 pracovních dnů od přijetí platby.</p>
        <ul class="w-full space-y-3">
          <li v-for="method in shippingMethods" :key="method.name" class="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
            <div class="flex items-center gap-2">
              <Icon :icon="method.icon" class="text-primary-300" />
              <span>{{ method.name }}</span>
            </div>
            <span class="font-bold text-white">{{ method.price }}</span>
          </li>
        </ul>
      </div>

      <!-- Payment Info -->
      <div class="glass-card-strong p-6 md:p-8 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
          <Icon icon="mdi:credit-card-outline" height="32" class="text-emerald-400" />
        </div>
        <h2 class="text-xl font-bold text-white mb-4">Platba</h2>
        <p class="text-sm mb-6">Bezpečná online platba přes bránu Stripe.</p>
        <div class="space-y-4 w-full">
          <div class="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center gap-3">
            <div class="flex gap-4 items-center">
              <Icon icon="logos:stripe" height="20" />
              <div class="flex gap-1">
                <Icon icon="logos:visa" height="12" />
                <Icon icon="logos:mastercard" height="12" />
                <Icon icon="logos:google-pay" height="12" />
              </div>
            </div>
            <p class="text-xs text-white/40 italic">Zpracováváme platby kartou, Apple Pay i Google Pay pro váš maximální komfort.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card p-6 md:p-10 space-y-10">
      <section>
        <h2 class="text-2xl font-black text-white mb-6 border-b border-primary-500/20 pb-2">Vrácení zboží & Odstoupení</h2>
        <div class="space-y-4">
          <p>
            Máte právo odstoupit od smlouvy bez udání důvodu do <strong>14 dnů</strong> od převzetí zboží.
          </p>
          <div class="p-5 bg-white/5 border-l-4 border-primary-500 rounded-r-xl">
            <h3 class="font-bold text-white mb-2">Postup pro vrácení:</h3>
            <ol class="list-decimal list-inside space-y-2 ml-2">
              <li>Kontaktujte nás e-mailem na <strong class="text-primary-300">hello@shopik.space</strong></li>
              <li>Zboží pečlivě zabalte do původního obalu.</li>
              <li>Odešlete na adresu: Kristýna Egnerová, Kosmická 42, 110 00 Praha.</li>
            </ol>
          </div>
          <p class="text-sm text-white/40 italic">Peníze vracíme stejným způsobem, jakým byla platba přijata (přes Stripe), a to do 14 dnů od převzetí vráceného zboží.</p>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-black text-white mb-6 border-b border-amber-500/20 pb-2">Reklamační řád</h2>
        <div class="space-y-4">
          <p>
            Na všechno nové zboží se vztahuje záruční doba <strong>24 měsíců</strong>.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-5 bg-white/5 rounded-xl">
              <h3 class="font-bold text-white mb-3">Na co se záruka vztahuje?</h3>
              <p class="text-sm">Zákonná záruka se vztahuje na výrobní vady a vady materiálu, které se projeví v záruční době.</p>
            </div>
            <div class="p-5 bg-white/5 rounded-xl border border-red-500/10">
              <h3 class="font-bold text-white mb-3 text-red-400">Na co se záruka nevztahuje?</h3>
              <p class="text-sm">Běžné opotřebení způsobené používáním, mechanické poškození nebo nevhodné zacházení (vzhledem k povaze ruční výroby).</p>
            </div>
          </div>
          <p class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-sm font-medium">
            Reklamaci vyřídíme v zákonné lhůtě nejpozději do 30 dnů.
          </p>
        </div>
      </section>
    </div>

    <div class="mt-12 text-center">
      <NuxtLink to="/" class="btn-cosmic px-8 py-3 inline-flex items-center gap-2">
        <Icon icon="mdi:arrow-left" />
        Zpět k nákupu
      </NuxtLink>
    </div>
  </div>
</template>
