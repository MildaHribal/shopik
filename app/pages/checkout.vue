<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";
import { useAuth } from "~/composables/useAuth";

const cart = useCartStore();
const { currentUser } = useAuth();
const toast = useCosmicToast();
const router = useRouter();

useSeoMeta({
  title: 'Pokladna',
  description: 'Dokončení objednávky v Shopik.',
  robots: 'noindex,nofollow',
});

const step = ref<'form' | 'success'>('form');
const orderId = ref<number | null>(null);
const isSubmitting = ref(false);
const agreedToTerms = ref(false);
const paymentMethod = ref<'cash' | 'bank-transfer'>('cash');

type BankInfo = {
  iban: string;
  holder: string;
  amount: number;
  variableSymbol: number | string;
  qrDataUrl: string | null;
};
const successBank = ref<BankInfo | null>(null);
const successPaymentMethod = ref<'cash' | 'bank-transfer'>('cash');

type ZBox = { id: string; name: string; address: string };
const zbox = ref<ZBox | null>(null);

const form = ref({
  customerName: '',
  customerEmail: '',
  phone: '',
});

const SHIPPING_PRICE = 79;
const COD_FEE = 60;

// ── Packeta widget: load script once ────────────────────────────────
useHead({
  script: [
    { src: 'https://widget.packeta.com/v6/www/js/library.js', async: true },
  ],
});

const openPacketaWidget = () => {
  const w = window as any;
  if (typeof w.Packeta === 'undefined') {
    toast.error('Widget Zásilkovny se nepodařilo načíst.', 'Zkuste obnovit stránku.');
    return;
  }
  const apiKey = useRuntimeConfig().public.packetaApiKey;

  w.Packeta.Widget.pick(
    apiKey,
    (point: any) => {
      if (!point) return;
      const address = [point.street, point.city, point.zip].filter(Boolean).join(', ');
      zbox.value = {
        id: String(point.id),
        name: point.name || point.nameStreet || `Z-BOX ${point.id}`,
        address,
      };
    },
    {
      country: 'cz',
      language: 'cs',
      // Filter to Z-BOX pickup points only
      vendors: [{ country: 'cz', group: 'zbox' }],
    },
  );
};

// ── Prefill from user profile ───────────────────────────────────────
const { data: userProfile } = await useFetch(
  () => (currentUser.value ? '/api/user/profile' : ''),
  { immediate: !!currentUser.value, watch: [currentUser], default: () => null },
);

watch(
  [userProfile, currentUser],
  ([profile, user]) => {
    const p: any = profile;
    if (p) {
      form.value.customerName = p.name ?? form.value.customerName;
      form.value.customerEmail = user?.email ?? p.email ?? form.value.customerEmail;
      form.value.phone = p.phone ?? form.value.phone;
    } else if (user?.email && !form.value.customerEmail) {
      form.value.customerEmail = user.email;
    }
  },
  { immediate: true },
);

// ── Validation & totals ─────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s()\-]{9,20}$/;
const codFee = computed(() => (paymentMethod.value === 'cash' ? COD_FEE : 0));
const totalWithShipping = computed(() => cart.totalPrice + SHIPPING_PRICE + codFee.value);

const formValid = computed(() => {
  return (
    form.value.customerName.trim().length > 1 &&
    emailRegex.test(form.value.customerEmail) &&
    phoneRegex.test(form.value.phone.trim()) &&
    !!zbox.value &&
    agreedToTerms.value
  );
});

// ── Submit ──────────────────────────────────────────────────────────
async function placeOrder() {
  if (!formValid.value || cart.items.length === 0 || !zbox.value) return;
  isSubmitting.value = true;
  try {
    const shippingAddressText = `${zbox.value.name} — ${zbox.value.address}`;
    const response: any = await $fetch('/api/orders', {
      method: 'POST',
      body: {
        customerName: form.value.customerName,
        customerEmail: form.value.customerEmail,
        phone: form.value.phone,
        street: shippingAddressText,
        city: 'Z-BOX',
        zip: '',
        paymentMethod: paymentMethod.value,
        shippingMethod: 'packeta-zbox',
        packetaBranchId: zbox.value.id,
        packetaBranchName: shippingAddressText,
        items: cart.items.map((item) => ({ id: item.id, quantity: item.quantity })),
      },
    });
    orderId.value = response.orderId;
    successPaymentMethod.value = paymentMethod.value;
    successBank.value = response.bank || null;
    cart.clearCart();
    step.value = 'success';
  } catch (err: any) {
    toast.error(
      'Objednávku se nepodařilo odeslat',
      err?.data?.statusMessage || err?.statusMessage || 'Zkuste to znovu.',
    );
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="checkout-page mx-auto max-w-5xl px-4 md:px-8 py-8 md:py-12">
    <!-- ─── Form ─────────────────────────────────────────────────── -->
    <div v-if="step === 'form'" class="flex flex-col lg:flex-row gap-6">
      <div class="flex-grow min-w-0">
        <div class="flex items-center gap-3 mb-6">
          <NuxtLink to="/cart" class="checkout-back" aria-label="Zpět do košíku">
            <Icon icon="ep:arrow-left-bold" height="18" />
          </NuxtLink>
          <h1 class="checkout-title">Pokladna</h1>
        </div>

        <!-- Osobní údaje -->
        <section class="checkout-card mb-4">
          <h2 class="checkout-section-title">
            <Icon icon="mdi:account-outline" class="checkout-section-icon" height="18" />
            Kontaktní údaje
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="checkout-label">Jméno a příjmení *</label>
              <input v-model="form.customerName" type="text" required placeholder="Jan Novák" class="checkout-input" />
            </div>
            <div>
              <label class="checkout-label">Email *</label>
              <input v-model="form.customerEmail" type="email" required placeholder="jan@email.cz" class="checkout-input" />
            </div>
            <div class="md:col-span-2">
              <label class="checkout-label">Telefon *</label>
              <input v-model="form.phone" type="tel" required placeholder="+420 123 456 789" class="checkout-input" />
            </div>
          </div>
        </section>

        <!-- Z-BOX výběr -->
        <section class="checkout-card mb-4">
          <h2 class="checkout-section-title">
            <Icon icon="mdi:package-variant-closed" class="checkout-section-icon" height="18" />
            Doručení do Z-BOXu
          </h2>
          <p class="checkout-note">
            Doručení Zásilkovnou do samoobslužného Z-BOXu. Balík si vyzvednete pomocí PIN kódu 24/7.
          </p>

          <div class="zbox-row">
            <div class="flex items-center gap-3 min-w-0">
              <div class="zbox-icon">
                <Icon icon="mdi:archive-outline" height="24" />
              </div>
              <div class="min-w-0">
                <div class="checkout-caption">Vybraný Z-BOX</div>
                <template v-if="zbox">
                  <div class="zbox-name">
                    <Icon icon="mdi:check-decagram" class="zbox-check" />
                    {{ zbox.name }}
                  </div>
                  <div class="zbox-address">{{ zbox.address }}</div>
                </template>
                <div v-else class="zbox-empty">Ještě není vybráno</div>
              </div>
            </div>
            <button @click.prevent="openPacketaWidget" class="btn-primary-pop whitespace-nowrap">
              <Icon icon="mdi:map-marker" height="18" />
              {{ zbox ? 'Změnit' : 'Vybrat Z-BOX' }}
            </button>
          </div>
        </section>

        <!-- Platba -->
        <section class="checkout-card mb-4">
          <h2 class="checkout-section-title">
            <Icon icon="mdi:cash-multiple" class="checkout-section-icon" height="18" />
            Platba
          </h2>
          <div class="payment-options">
            <label class="payment-option" :class="{ 'is-active': paymentMethod === 'cash' }">
              <input type="radio" v-model="paymentMethod" value="cash" class="payment-radio" />
              <div class="payment-icon">
                <Icon icon="mdi:cash-multiple" height="22" />
              </div>
              <div class="flex-grow">
                <div class="payment-title">
                  Dobírka
                  <span class="payment-fee">+{{ COD_FEE }} Kč</span>
                </div>
                <div class="payment-note">Zaplatíte při vyzvednutí v Z-BOXu.</div>
              </div>
            </label>
            <label class="payment-option" :class="{ 'is-active': paymentMethod === 'bank-transfer' }">
              <input type="radio" v-model="paymentMethod" value="bank-transfer" class="payment-radio" />
              <div class="payment-icon payment-icon--bank">
                <Icon icon="mdi:bank-transfer" height="22" />
              </div>
              <div class="flex-grow">
                <div class="payment-title">Převod na účet</div>
                <div class="payment-note">Zobrazí se QR kód pro rychlou platbu. Objednávka se odešle po přijetí platby.</div>
              </div>
            </label>
          </div>
        </section>

        <!-- Souhlas -->
        <div class="mb-5">
          <label class="terms-row">
            <input v-model="agreedToTerms" type="checkbox" class="terms-checkbox" />
            <span class="terms-text">
              Souhlasím s
              <NuxtLink to="/obchodni-podminky" target="_blank" class="terms-link">obchodními podmínkami</NuxtLink>
              a
              <NuxtLink to="/ochrana-osobnich-udaju" target="_blank" class="terms-link">zásadami zpracování osobních údajů</NuxtLink>.
            </span>
          </label>
        </div>

        <button
          @click="placeOrder"
          :disabled="!formValid || isSubmitting"
          class="btn-primary-pop w-full justify-center py-4 text-lg"
        >
          <Icon v-if="isSubmitting" icon="lucide:loader-2" height="22" class="animate-spin" />
          <Icon v-else icon="mdi:check-decagram" height="22" />
          {{ isSubmitting ? 'Odesíláme...' : 'Odeslat objednávku' }}
        </button>
      </div>

      <!-- Souhrn -->
      <aside class="lg:w-80 flex-shrink-0">
        <div class="summary-card sticky top-24">
          <h3 class="summary-title">Váš košík</h3>
          <div class="summary-items">
            <div v-for="item in cart.items" :key="item.id" class="summary-item">
              <div class="summary-thumb">
                <NuxtImg
                  v-if="item.image"
                  :src="item.image.startsWith('http') ? item.image : `/${item.image}`"
                  class="w-full h-full object-cover"
                  width="80"
                  height="80"
                  format="webp"
                  loading="lazy"
                />
                <div v-else class="summary-thumb-empty">
                  <Icon icon="mdi:image-off" height="14" />
                </div>
              </div>
              <div class="min-w-0 flex-grow">
                <div class="summary-item-title">{{ item.title }}</div>
                <div class="summary-item-qty">{{ item.quantity }} × {{ item.price }} Kč</div>
              </div>
            </div>
          </div>

          <div class="summary-totals">
            <div class="summary-row">
              <span>Mezisoučet</span><span>{{ cart.totalPrice }} Kč</span>
            </div>
            <div class="summary-row">
              <span>Doprava (Zásilkovna Z-BOX)</span><span>{{ SHIPPING_PRICE }} Kč</span>
            </div>
            <div v-if="codFee > 0" class="summary-row">
              <span>Dobírka</span><span>{{ codFee }} Kč</span>
            </div>
            <div class="summary-row summary-total">
              <span>Celkem</span>
              <span>{{ totalWithShipping }} Kč</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- ─── Success ──────────────────────────────────────────────── -->
    <div v-else class="max-w-xl mx-auto text-center py-16">
      <div class="success-badge">
        <Icon icon="mdi:check-bold" height="48" />
      </div>
      <h1 class="success-title">Objednáno! 🚀</h1>
      <p class="success-subtitle">
        Objednávka <span class="success-code">#{{ orderId }}</span> byla přijata.
      </p>

      <!-- Bank transfer: show QR + payment details -->
      <div v-if="successPaymentMethod === 'bank-transfer'" class="success-panel bank-panel">
        <h3 class="bank-title">Zaplať převodem</h3>
        <p class="bank-lead">
          Naskenuj QR kód v mobilním bankovnictví nebo použij údaje níže. Objednávka se zpracuje po přijetí platby.
        </p>

        <div v-if="successBank && successBank.qrDataUrl" class="bank-qr-wrap">
          <img :src="successBank.qrDataUrl" alt="QR kód pro platbu převodem" class="bank-qr" width="220" height="220" />
        </div>

        <div v-if="successBank" class="bank-details">
          <div class="bank-row"><span>IBAN</span><strong>{{ successBank.iban }}</strong></div>
          <div class="bank-row"><span>Částka</span><strong>{{ successBank.amount.toLocaleString('cs-CZ') }} Kč</strong></div>
          <div class="bank-row"><span>Variabilní symbol</span><strong>{{ successBank.variableSymbol }}</strong></div>
          <div class="bank-row"><span>Zpráva pro příjemce</span><strong>Objednávka {{ successBank.variableSymbol }}</strong></div>
        </div>
        <div v-else class="bank-warning">
          <Icon icon="mdi:alert-circle-outline" height="18" />
          Platební údaje nejsou nakonfigurovány — pošlu ti je e-mailem.
        </div>

        <div class="bank-footer">
          Potvrzení objednávky ti dorazí na e-mail. Po přijetí platby přijde další potvrzení.
        </div>
      </div>

      <div v-else class="success-panel">
        Do e-mailu ti dorazí potvrzení. Platba proběhne při vyzvednutí v Z-BOXu.
        <template v-if="currentUser">
          Objednávku najdeš v
          <NuxtLink to="/user" class="terms-link">Můj profil → Objednávky</NuxtLink>.
        </template>
      </div>

      <NuxtLink to="/" class="btn-primary-pop px-8 py-3 inline-flex">
        <Icon icon="mdi:store-outline" height="20" />
        Zpět k nakupování
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* ── Palette overrides (checkout uses dark text on pastel body) ── */
.checkout-page {
  color: var(--pop-ink, #2a1340);
}

.checkout-back {
  color: rgba(42, 19, 64, 0.45);
  transition: color 0.2s;
}
.checkout-back:hover {
  color: var(--pop-ink, #2a1340);
}

.checkout-title {
  font-family: 'Berkshire Swash', 'Petrona', cursive;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 1;
  color: var(--pop-ink, #2a1340);
  letter-spacing: -0.02em;
}

/* ── Cards ── */
.checkout-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(42, 19, 64, 0.1);
  border-radius: 1.25rem;
  padding: 1.25rem 1.25rem;
  box-shadow: 0 2px 12px rgba(42, 19, 64, 0.06);
}
@media (min-width: 768px) {
  .checkout-card { padding: 1.5rem 1.5rem; }
}

.checkout-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--pop-ink, #2a1340);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(42, 19, 64, 0.08);
}
.checkout-section-icon {
  color: var(--pop-lavender, #6b4ea7);
}

.checkout-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(42, 19, 64, 0.6);
  margin-bottom: 0.35rem;
  letter-spacing: 0.02em;
}

.checkout-input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(42, 19, 64, 0.15);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 0.65rem;
  color: var(--pop-ink, #2a1340);
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.checkout-input::placeholder {
  color: rgba(42, 19, 64, 0.35);
}
.checkout-input:focus {
  outline: none;
  border-color: rgba(107, 78, 167, 0.55);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(107, 78, 167, 0.12);
}

.checkout-note {
  font-size: 0.85rem;
  color: rgba(42, 19, 64, 0.65);
  margin-bottom: 1rem;
}
.checkout-caption {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(42, 19, 64, 0.55);
  font-weight: 700;
  margin-bottom: 0.15rem;
}

/* ── Z-BOX row ── */
.zbox-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: rgba(189, 166, 206, 0.18);
  border: 1px solid rgba(107, 78, 167, 0.2);
}
@media (min-width: 640px) {
  .zbox-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.zbox-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #cc0000, #ff3d3d);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(204, 0, 0, 0.25);
}
.zbox-name {
  font-weight: 700;
  color: var(--pop-ink, #2a1340);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.95rem;
}
.zbox-check {
  color: #2e7d32;
}
.zbox-address {
  font-size: 0.8rem;
  color: rgba(42, 19, 64, 0.7);
  margin-top: 2px;
}
.zbox-empty {
  color: #b3324c;
  font-weight: 600;
  font-size: 0.9rem;
}

/* ── Payment options ── */
.payment-options { display: flex; flex-direction: column; gap: 0.6rem; }
.payment-option {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(42, 19, 64, 0.12);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.payment-option:hover { border-color: rgba(42, 19, 64, 0.3); }
.payment-option.is-active {
  border-color: #b3324c;
  background: rgba(179, 50, 76, 0.06);
  box-shadow: 0 0 0 3px rgba(179, 50, 76, 0.08);
}
.payment-radio {
  width: 18px;
  height: 18px;
  accent-color: #b3324c;
  cursor: pointer;
  flex-shrink: 0;
}
.payment-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(46, 125, 50, 0.15);
  color: #2e7d32;
  display: flex;
  align-items: center;
  justify-content: center;
}
.payment-icon--bank {
  background: rgba(107, 78, 167, 0.15);
  color: #6b4ea7;
}
.payment-title {
  font-weight: 700;
  color: var(--pop-ink, #2a1340);
  font-size: 0.98rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.payment-fee {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #b3324c;
  background: rgba(179, 50, 76, 0.1);
  border: 1px solid rgba(179, 50, 76, 0.25);
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.payment-note {
  font-size: 0.8rem;
  color: rgba(42, 19, 64, 0.7);
}

/* ── Bank transfer success panel ── */
.bank-panel {
  text-align: left;
}
.bank-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--pop-ink);
  margin: 0 0 0.75rem;
  text-align: center;
}
.bank-lead {
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgba(42, 19, 64, 0.75);
  margin: 0 0 1.25rem;
  text-align: center;
}
.bank-qr-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}
.bank-qr {
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.75rem;
  box-shadow: 0 4px 18px rgba(42, 19, 64, 0.14);
  border: 1px solid rgba(42, 19, 64, 0.1);
}
.bank-details {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(42, 19, 64, 0.1);
}
.bank-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(42, 19, 64, 0.7);
}
.bank-row strong {
  color: var(--pop-ink);
  font-weight: 700;
  word-break: break-all;
  text-align: right;
}
.bank-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  background: rgba(255, 200, 80, 0.18);
  border: 1px solid rgba(138, 90, 0, 0.25);
  color: #6a4400;
  border-radius: 0.75rem;
  font-size: 0.88rem;
}
.bank-footer {
  margin-top: 1.25rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(42, 19, 64, 0.08);
  font-size: 0.82rem;
  color: rgba(42, 19, 64, 0.6);
  text-align: center;
}

/* ── Terms ── */
.terms-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  cursor: pointer;
}
.terms-checkbox {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  accent-color: #6b4ea7;
  cursor: pointer;
  flex-shrink: 0;
}
.terms-text {
  font-size: 0.85rem;
  color: rgba(42, 19, 64, 0.75);
  line-height: 1.5;
}
.terms-link {
  color: #6b4ea7;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}
.terms-link:hover { color: #4c1d95; }

/* ── Primary button (pastel-safe) ── */
.btn-primary-pop {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1.2rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6b4ea7, #b3324c);
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  box-shadow: 0 4px 18px rgba(107, 78, 167, 0.3);
}
.btn-primary-pop:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(107, 78, 167, 0.4);
}
.btn-primary-pop:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── Summary card ── */
.summary-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(42, 19, 64, 0.1);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(42, 19, 64, 0.08);
}
.summary-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--pop-ink, #2a1340);
  margin-bottom: 1rem;
}
.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 1rem;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.summary-thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(42, 19, 64, 0.06);
}
.summary-thumb-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(42, 19, 64, 0.3);
}
.summary-item-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--pop-ink, #2a1340);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary-item-qty {
  font-size: 0.72rem;
  color: rgba(42, 19, 64, 0.55);
}
.summary-totals {
  border-top: 1px solid rgba(42, 19, 64, 0.1);
  padding-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(42, 19, 64, 0.65);
}
.summary-total {
  padding-top: 0.6rem;
  border-top: 1px solid rgba(42, 19, 64, 0.1);
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--pop-ink, #2a1340);
  margin-top: 0.2rem;
}

/* ── Success ── */
.success-badge {
  position: relative;
  display: inline-flex;
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6b4ea7, #b3324c);
  color: #fff;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  box-shadow: 0 12px 30px rgba(107, 78, 167, 0.35);
}
.success-title {
  font-family: 'Berkshire Swash', 'Petrona', cursive;
  font-size: clamp(2rem, 6vw, 3rem);
  color: var(--pop-ink, #2a1340);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}
.success-subtitle {
  font-size: 1.05rem;
  color: rgba(42, 19, 64, 0.7);
  margin-bottom: 1.75rem;
}
.success-code {
  font-family: 'Menlo', monospace;
  font-weight: 700;
  color: #6b4ea7;
}
.success-panel {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(42, 19, 64, 0.1);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  color: rgba(42, 19, 64, 0.75);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  text-align: left;
}
</style>
