<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";
import { useAuth } from "~/composables/useAuth";

const cart = useCartStore();
const { currentUser } = useAuth();
const toast = useToast()

const step = ref<'details' | 'payment' | 'success'>('details');
const orderId = ref<number | null>(null);
const isSubmitting = ref(false);

const form = ref({
  customerName: '',
  customerEmail: '',
  phone: '',
  street: '',
  city: '',
  zip: '',
  paymentMethod: 'card',
  shippingMethod: 'zasilkovna',
});

// Předvyplnění z profilu pro přihlášené uživatele
const { data: userProfile } = await useFetch(
  () => (currentUser.value ? '/api/user/profile' : null),
  { default: () => null }
);
watch(
  [userProfile, currentUser],
  ([profile, user]) => {
    if (profile) {
      form.value.customerName = profile.name ?? '';
      form.value.customerEmail = user?.email ?? profile.email ?? '';
      form.value.phone = profile.phone ?? '';
      form.value.street = profile.street ?? '';
      form.value.city = profile.city ?? '';
      form.value.zip = profile.zip ?? '';
    } else if (user?.email && !form.value.customerEmail) {
      form.value.customerEmail = user.email;
    }
  },
  { immediate: true }
);

const paymentMethods = [
  { value: 'card',      label: 'Platební karta', note: 'Visa, Mastercard, Maestro', icon: 'mdi:credit-card-outline' },
  { value: 'googlepay', label: 'Google Pay',     note: 'Rychlá platba přes Google', icon: 'logos:google-pay' },
  { value: 'paypal',    label: 'PayPal',          note: 'Platba přes PayPal účet',  icon: 'logos:paypal' },
  { value: 'cash',      label: 'Dobírka',         note: 'Platba při převzetí',       icon: 'mdi:cash-multiple' },
];

const shippingMethods = [
  {
    value: 'zasilkovna',
    label: 'Zásilkovna',
    note: 'Výdejní místo dle výběru',
    price: 79,
    logo: 'zasilkovna',
  },
  {
    value: 'ceska-posta',
    label: 'Česká pošta',
    note: 'Doručení do 2–3 pracovních dní',
    price: 99,
    logo: 'ceska-posta',
  },
  {
    value: 'balikovna',
    label: 'Balíkovna',
    note: 'Výdejní místo Balíkovny',
    price: 69,
    logo: 'balikovna',
  },
  {
    value: 'osobni',
    label: 'Osobní vyzvednutí',
    note: 'Praha, Vesmírná 42 – zdarma',
    price: 0,
    logo: 'osobni',
  },
];

const selectedShipping = computed(() =>
  shippingMethods.find(s => s.value === form.value.shippingMethod)
);

const totalWithShipping = computed(() => {
  return cart.totalPrice + (selectedShipping.value?.price ?? 0);
});

const paymentLabel = computed(() =>
  paymentMethods.find(p => p.value === form.value.paymentMethod)?.label ?? ''
);

const detailsValid = computed(() =>
  form.value.customerName &&
  form.value.customerEmail &&
  form.value.street &&
  form.value.city &&
  form.value.zip
);

async function placeOrder() {
  if (cart.items.length === 0) return;
  isSubmitting.value = true;
  try {
    const response: any = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        ...form.value,
        items: cart.items.map(item => ({ id: item.id, quantity: 1 }))
      }
    });
    orderId.value = response.orderId;
    cart.clearCart();
    step.value = 'success';
  } catch (err: any) {
    toast.error('Objednávku se nepodařilo odeslat', err?.data?.statusMessage || 'Zkuste to znovu.');
  } finally {
    isSubmitting.value = false;
  }
}

function isSelected(field: 'paymentMethod' | 'shippingMethod', val: string) {
  return form.value[field] === val;
}

function selectedStyle(active: boolean) {
  return active
    ? 'border-color: rgba(139,92,246,0.7); background: rgba(139,92,246,0.08);'
    : 'border-color: rgba(255,255,255,0.07); background: rgba(255,255,255,0.02);';
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-14">

    <!-- ─── KROK 1: Dodací údaje ──────────────────────────────────── -->
    <div v-if="step === 'details'" class="flex flex-col lg:flex-row gap-8">
      <div class="flex-grow min-w-0">

        <!-- Header -->
        <div class="flex items-center gap-3 mb-7">
          <NuxtLink to="/cart" class="text-white/30 hover:text-white transition-colors">
            <Icon icon="ep:arrow-left-bold" height="18" />
          </NuxtLink>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white neon-text">Pokladna 🛒</h1>
        </div>

        <!-- Osobní údaje -->
        <div class="glass-card-strong p-5 md:p-7 mb-5">
          <h2 class="text-base font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-2">
            <Icon icon="mdi:account-outline" class="text-primary-400" height="18" />
            Osobní a doručovací údaje
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-xs text-white/40 mb-1.5 font-medium">Celé jméno *</label>
              <input v-model="form.customerName" type="text" required placeholder="Jan Novák" class="input-cosmic" />
            </div>
            <div>
              <label class="block text-xs text-white/40 mb-1.5 font-medium">Email *</label>
              <input v-model="form.customerEmail" type="email" required placeholder="jan@email.cz" class="input-cosmic" />
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-xs text-white/40 mb-1.5 font-medium">Telefon</label>
            <input v-model="form.phone" type="tel" placeholder="+420 123 456 789" class="input-cosmic" />
          </div>
          <div class="mb-4">
            <label class="block text-xs text-white/40 mb-1.5 font-medium">Ulice a číslo popisné *</label>
            <input v-model="form.street" type="text" required placeholder="Vesmírná 42" class="input-cosmic" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-white/40 mb-1.5 font-medium">Město *</label>
              <input v-model="form.city" type="text" required placeholder="Praha" class="input-cosmic" />
            </div>
            <div>
              <label class="block text-xs text-white/40 mb-1.5 font-medium">PSČ *</label>
              <input v-model="form.zip" type="text" required placeholder="100 00" class="input-cosmic" />
            </div>
          </div>
        </div>

        <!-- Způsob dopravy -->
        <div class="glass-card-strong p-5 md:p-7 mb-5">
          <h2 class="text-base font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-2">
            <Icon icon="mdi:truck-outline" class="text-primary-400" height="18" />
            Způsob dopravy
          </h2>
          <div class="space-y-2.5">
            <label v-for="method in shippingMethods" :key="method.value" class="cursor-pointer block">
              <input type="radio" v-model="form.shippingMethod" :value="method.value" class="hidden" />
              <div class="rounded-xl border transition-all duration-200 flex items-center gap-3 px-4 py-3"
                :style="selectedStyle(isSelected('shippingMethod', method.value))">

                <!-- Logo -->
                <!-- Zásilkovna -->
                <div v-if="method.logo === 'zasilkovna'" class="flex-shrink-0 h-8 w-24 flex items-center justify-center rounded-md overflow-hidden" style="background: #cc0000;">
                  <span class="text-white font-bold text-[11px] tracking-tight leading-none px-1">🚚 Zásilkovna</span>
                </div>
                <!-- Česká pošta -->
                <div v-else-if="method.logo === 'ceska-posta'" class="flex-shrink-0 h-8 w-24 flex items-center justify-center rounded-md overflow-hidden gap-1" style="background: #1a3a6b;">
                  <span class="text-[18px] leading-none">📯</span>
                  <span class="text-white font-bold text-[10px] tracking-tight leading-tight">Česká<br>pošta</span>
                </div>
                <!-- Balíkovna -->
                <div v-else-if="method.logo === 'balikovna'" class="flex-shrink-0 h-8 w-24 flex items-center justify-center rounded-md gap-1 overflow-hidden" style="background: #fff;">
                  <div class="flex flex-col gap-0.5">
                    <div class="flex gap-0.5">
                      <div class="w-2 h-2 rounded-sm" style="background: #f5c800;"></div>
                      <div class="w-2 h-2 rounded-sm" style="background: #0d3880;"></div>
                    </div>
                    <div class="flex gap-0.5">
                      <div class="w-2 h-2 rounded-sm" style="background: #0d3880;"></div>
                      <div class="w-2 h-2 rounded-sm" style="background: #0d3880;"></div>
                    </div>
                  </div>
                  <span class="text-[11px] font-bold tracking-tight" style="color: #0d3880;">Balíkovna</span>
                </div>
                <!-- Osobní vyzvednutí -->
                <div v-else class="flex-shrink-0 h-8 w-24 flex items-center justify-center gap-1 rounded-md" style="background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);">
                  <Icon icon="mdi:store-marker-outline" class="text-primary-300" height="16" />
                  <span class="text-primary-300 font-semibold text-[10px] leading-tight">Osobní<br>vyzvednutí</span>
                </div>

                <!-- Info -->
                <div class="flex-grow min-w-0">
                  <div class="font-semibold text-white text-sm">{{ method.label }}</div>
                  <div class="text-[11px] text-white/40">{{ method.note }}</div>
                </div>

                <!-- Cena -->
                <div class="flex-shrink-0 text-right">
                  <span v-if="method.price === 0" class="text-green-400 font-bold text-sm">Zdarma</span>
                  <span v-else class="text-white font-semibold text-sm">{{ method.price }} Kč</span>
                </div>

                <!-- Check -->
                <Icon v-if="isSelected('shippingMethod', method.value)" icon="mdi:check-circle" height="18" class="text-primary-400 flex-shrink-0" />
                <div v-else class="w-[18px] flex-shrink-0"></div>
              </div>
            </label>
          </div>
        </div>

        <!-- Způsob platby -->
        <div class="glass-card-strong p-5 md:p-7 mb-6">
          <h2 class="text-base font-bold text-white mb-5 pb-3 border-b border-white/10 flex items-center gap-2">
            <Icon icon="mdi:credit-card-outline" class="text-primary-400" height="18" />
            Způsob platby
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label v-for="pm in paymentMethods" :key="pm.value" class="cursor-pointer">
              <input type="radio" v-model="form.paymentMethod" :value="pm.value" class="hidden" />
              <div class="rounded-xl border transition-all duration-200 flex items-center gap-3 px-4 py-3 h-full"
                :style="selectedStyle(isSelected('paymentMethod', pm.value))">
                <Icon :icon="pm.icon" height="24" :style="isSelected('paymentMethod', pm.value) ? 'color:#a78bfa;' : 'color:rgba(255,255,255,0.4);'" />
                <div class="flex-grow">
                  <div class="font-semibold text-white text-sm">{{ pm.label }}</div>
                  <div class="text-[11px] text-white/40">{{ pm.note }}</div>
                </div>
                <Icon v-if="isSelected('paymentMethod', pm.value)" icon="mdi:check-circle" height="16" class="text-primary-400 flex-shrink-0" />
              </div>
            </label>
          </div>
        </div>

        <button
          @click="step = 'payment'"
          :disabled="!detailsValid"
          class="btn-cosmic w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
          <Icon icon="mdi:arrow-right" height="22" />
          Pokračovat k potvrzení objednávky
        </button>
      </div>

      <!-- Souhrn košíku -->
      <div class="lg:w-88 flex-shrink-0">
        <div class="glass-card-strong p-5 sticky top-6 gradient-border">
          <h3 class="text-base font-bold text-white mb-4 neon-text-cyan">Váš košík</h3>
          <div class="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
            <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0" style="background:rgba(255,255,255,0.05);">
                <NuxtImg
                  v-if="item.image"
                  :src="item.image.startsWith('http') ? item.image : `/${item.image}`"
                  class="w-full h-full object-cover"
                  width="80"
                  height="80"
                  format="webp"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-white/20">
                  <Icon icon="mdi:image-off" height="14" />
                </div>
              </div>
              <div class="flex-grow min-w-0">
                <div class="text-xs font-medium text-white truncate">{{ item.title }}</div>
                <div class="text-[11px] text-white/40">1 × {{ item.price }} Kč</div>
              </div>
            </div>
          </div>
          <div class="border-t border-white/10 pt-4 space-y-2">
            <div class="flex justify-between text-sm text-white/40">
              <span>Mezisoučet</span><span>{{ cart.totalPrice }} Kč</span>
            </div>
            <div class="flex justify-between text-sm text-white/40">
              <span>Doprava ({{ selectedShipping?.label }})</span>
              <span :class="selectedShipping?.price === 0 ? 'text-green-400 font-medium' : 'text-white'">
                {{ selectedShipping?.price === 0 ? 'Zdarma' : `${selectedShipping?.price} Kč` }}
              </span>
            </div>
            <div class="flex justify-between text-lg font-black pt-2">
              <span class="text-white">Celkem</span>
              <span class="neon-text-rainbow">{{ totalWithShipping }} Kč</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── KROK 2: Potvrzení (platba přeskočena) ─────────────────── -->
    <div v-else-if="step === 'payment'" class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-7">
        <button @click="step = 'details'" class="text-white/30 hover:text-white transition-colors">
          <Icon icon="ep:arrow-left-bold" height="18" />
        </button>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white neon-text">Potvrzení objednávky ✅</h1>
      </div>

      <!-- Demo info -->
      <div class="glass-card-strong p-6 mb-5 text-center">
        <div class="text-5xl mb-3">🎭</div>
        <h2 class="text-xl font-bold text-white mb-2">Demo platba</h2>
        <p class="text-white/50 text-sm">V demo režimu se platba přeskočí. Stiskni tlačítko níže a objednávka se rovnou zpracuje.</p>
      </div>

      <!-- Shrnutí -->
      <div class="glass-card p-5 mb-5 space-y-3 text-sm">
        <h3 class="text-white font-bold text-base mb-1">Shrnutí objednávky</h3>
        <div class="flex justify-between">
          <span class="text-white/40">Zákazník</span>
          <span class="text-white">{{ form.customerName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/40">Email</span>
          <span class="text-white">{{ form.customerEmail }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/40">Adresa</span>
          <span class="text-white text-right">{{ form.street }}, {{ form.zip }} {{ form.city }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/40">Doprava</span>
          <span class="text-white">{{ selectedShipping?.label }} — {{ selectedShipping?.price === 0 ? 'Zdarma' : `${selectedShipping?.price} Kč` }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-white/40">Platba</span>
          <span class="text-white">{{ paymentLabel }}</span>
        </div>
        <div class="flex justify-between pt-3 border-t border-white/10 text-base font-bold">
          <span class="text-white">K zaplacení</span>
          <span class="neon-text-rainbow text-xl font-black">{{ totalWithShipping }} Kč</span>
        </div>
      </div>

      <button
        @click="placeOrder"
        :disabled="isSubmitting"
        class="btn-cosmic w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
        <Icon v-if="isSubmitting" icon="lucide:loader-2" height="24" class="animate-spin" />
        <Icon v-else icon="mdi:check-decagram" height="24" />
        {{ isSubmitting ? 'Odesíláme...' : 'Potvrdit a odeslat objednávku' }}
      </button>
    </div>

    <!-- ─── KROK 3: Úspěch ─────────────────────────────────────────── -->
    <div v-else class="max-w-xl mx-auto text-center py-16">
      <div class="relative inline-block mb-10">
        <div class="absolute inset-0 rounded-full scale-150 animate-pulse" style="background:rgba(139,92,246,0.25);filter:blur(30px);"></div>
        <div class="relative w-24 h-24 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl"
          style="background:linear-gradient(135deg,#8b5cf6,#ec4899);">
          <Icon icon="mdi:check-bold" height="48" />
        </div>
      </div>
      <h1 class="text-4xl md:text-5xl font-black text-white mb-4 neon-text-rainbow">Objednáno! 🚀</h1>
      <p class="text-lg text-white/60 mb-8">
        Vaše objednávka <span class="text-primary-400 font-mono font-bold">#{{ orderId }}</span> byla přijata.
      </p>
      <div class="glass-card p-5 mb-8 text-left text-sm text-white/50">
        <template v-if="currentUser">
          Objednávku vidíte v
          <NuxtLink to="/user" class="text-primary-400 hover:underline">Můj profil → Moje objednávky</NuxtLink>.
        </template>
        <template v-else>
          Objednávku vidíte v
          <NuxtLink to="/admin/orders" class="text-primary-400 hover:underline">Admin panelu → Objednávky</NuxtLink>.
        </template>
      </div>
      <NuxtLink to="/" class="btn-cosmic px-10 py-4 text-lg inline-flex items-center gap-3">
        <Icon icon="mdi:store-outline" height="22" />
        Zpět k nakupování
      </NuxtLink>
    </div>

  </div>
</template>
