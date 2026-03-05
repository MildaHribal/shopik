<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";

const route = useRoute();
const { data: product, pending, error } = await useFetch(`/api/products/${route.params.id}`);
const cart = useCartStore();
const toast = useCosmicToast()
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || useRequestURL().origin

const selectedImageIndex = ref(0);
const reviewRating = ref(5);
const reviewComment = ref("");
const isSubmittingReview = ref(false);
const isTogglingFavorite = ref(false);

// Fetch favorite status (API returns isFavorite: false when not logged in)
const productId = computed(() => product.value?.id);
const { data: favoriteStatus, refresh: refreshFavorite } = useFetch(
  () => (productId.value ? `/api/products/${productId.value}/favorite` : null),
  { default: () => ({ isFavorite: false }) }
);

// Fetch reviews
interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const { data: productReviews, refresh: refreshReviews } = useFetch<Review[]>(
  () => (productId.value ? `/api/products/${productId.value}/reviews` : null),
  { default: () => [] }
);

const isFavorite = computed(() => favoriteStatus.value?.isFavorite ?? false);

const allImages = computed(() => {
  if (!product.value) return [];
  const imgs = (product.value as any).images;
  if (imgs && Array.isArray(imgs) && imgs.length > 0) {
    return imgs.map((img: string) => (img.startsWith("http") ? img : `/${img}`));
  }
  if (product.value.image) {
    return [
      product.value.image.startsWith("http") ? product.value.image : `/${product.value.image}`,
    ];
  }
  return [];
});

const selectedImage = computed(() => allImages.value[selectedImageIndex.value] || null);
const canonicalUrl = computed(() => {
  const slug = (product.value as any)?.slug
  return `${siteUrl}/product/${slug || route.params.id}`
})

useSeoMeta({
  title: () => (product.value ? `${(product.value as any).title || (product.value as any).name} | Shopik` : 'Produkt | Shopik'),
  description: () => {
    const p: any = product.value
    const desc = p?.shortDescription || p?.description || ''
    return desc ? String(desc).slice(0, 160) : 'Detail produktu v Shopik.'
  },
  ogTitle: () => (product.value ? `${(product.value as any).title || (product.value as any).name} | Shopik` : 'Produkt | Shopik'),
  ogDescription: () => {
    const p: any = product.value
    const desc = p?.shortDescription || p?.description || ''
    return desc ? String(desc).slice(0, 200) : 'Detail produktu v Shopik.'
  },
  ogType: 'product',
  ogUrl: () => canonicalUrl.value,
  ogImage: () => selectedImage.value || undefined,
  twitterCard: 'summary_large_image',
})
useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))

const addToCart = () => {
  if (product.value) {
    cart.addToCart(product.value);
  }
};

const toggleFavorite = async () => {
  if (!product.value?.id || isTogglingFavorite.value) return;
  isTogglingFavorite.value = true;
  try {
    const result: any = await $fetch(`/api/products/${product.value.id}/favorite`, { method: "POST" });
    await refreshFavorite();
    if (result?.isFavorite === true) toast.success('Přidáno', 'Produkt je v oblíbených.')
    else if (result?.isFavorite === false) toast.info('Odebráno', 'Produkt byl odebrán z oblíbených.')
  } catch (err: any) {
    if (err?.statusCode === 401 || err?.data?.statusCode === 401) {
      toast.info('Je potřeba přihlášení', 'Pro oblíbené se prosím přihlaste.')
      return
    }
    toast.error('Nepodařilo se', err?.data?.statusMessage || "Akci se nepodařilo provést.");
  } finally {
    isTogglingFavorite.value = false;
  }
};

const submitReview = async () => {
  if (!product.value?.id || isSubmittingReview.value) return;
  if (reviewRating.value < 1 || reviewRating.value > 5) return;
  isSubmittingReview.value = true;
  try {
    await $fetch(`/api/products/${product.value.id}/review`, {
      method: "POST",
      body: { rating: reviewRating.value, comment: reviewComment.value },
    });
    reviewComment.value = "";
    reviewRating.value = 5;
    await refreshReviews();
    toast.success('Díky!', 'Recenze byla odeslána.')
  } catch (err: any) {
    if (err?.statusCode === 401 || err?.data?.statusCode === 401) {
      toast.info('Je potřeba přihlášení', 'Pro recenzi se prosím přihlaste.')
      return
    }
    toast.error('Nepodařilo se odeslat recenzi', err?.data?.statusMessage || "Recenzi se nepodařilo odeslat.");
  } finally {
    isSubmittingReview.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center items-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-white/40">Načítání produktu...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="glass-card-strong p-8 md:p-12 text-center">
      <div class="text-4xl mb-4">😵</div>
      <p class="font-bold text-lg text-white mb-2">Chyba při načítání</p>
      <p class="text-white/50">{{ error.message }}</p>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="relative">
      <!-- Back button -->
      <NuxtLink to="/" class="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 md:mb-8 group">
        <Icon icon="ep:arrow-left-bold" height="16" class="transition-transform group-hover:-translate-x-1" />
        <span class="text-sm">Zpět na úvod</span>
      </NuxtLink>

      <div class="glass-card-strong overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">

          <!-- Image Section -->
          <div class="p-4 md:p-8 bg-white/[0.02]">
            <!-- Main Image -->
            <div class="relative w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-black/20 mb-3 md:mb-4">
              <NuxtImg
                v-if="selectedImage"
                :src="selectedImage"
                :alt="product.title || product.name"
                class="h-full w-full object-cover object-center transition-all duration-500"
                width="1200"
                height="1200"
                format="webp"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="eager"
              />
              <div v-else class="flex h-full w-full items-center justify-center text-white/20">
                <Icon icon="mdi:image-off-outline" height="48" />
              </div>

              <!-- Image counter -->
              <div v-if="allImages.length > 1" class="absolute bottom-3 right-3 cosmic-badge text-[10px]">
                {{ selectedImageIndex + 1 }} / {{ allImages.length }}
              </div>
            </div>

            <!-- Thumbnail Strip -->
            <div v-if="allImages.length > 1" class="flex gap-2 md:gap-3 overflow-x-auto pb-2 hide-scrollbar">
              <button
                v-for="(img, idx) in allImages"
                :key="idx"
                @click="selectedImageIndex = idx"
                class="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all duration-300"
                :class="selectedImageIndex === idx
                  ? 'border-primary-500 shadow-lg shadow-primary-500/30 scale-105'
                  : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'"
              >
                <NuxtImg
                  :src="img"
                  :alt="`${product.title || product.name} - ${idx + 1}`"
                  class="w-full h-full object-cover"
                  width="160"
                  height="160"
                  format="webp"
                  loading="lazy"
                />
              </button>
            </div>
          </div>

          <!-- Content Section -->
          <div class="flex flex-col justify-center p-5 md:p-8 lg:p-12 text-white">
            <!-- Category -->
            <div class="mb-3 md:mb-5">
              <span class="cosmic-badge">
                {{ product.category }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 md:mb-5 neon-text leading-tight">
              {{ product.title }}
            </h1>

            <!-- Price -->
            <div class="flex items-baseline gap-2 mb-5 md:mb-8">
              <span class="text-3xl md:text-4xl font-black neon-text-rainbow">{{ product.price }}</span>
              <span class="text-lg md:text-xl text-white/40">Kč</span>
            </div>

            <!-- Description -->
            <div v-if="product.description" class="text-white/50 mb-6 md:mb-10 leading-relaxed text-sm md:text-base border-l-2 border-primary-500/30 pl-4">
              <p>{{ product.description }}</p>
            </div>

            <!-- Stock & Actions -->
            <div class="border-t border-white/10 pt-5 md:pt-8">
              <div class="flex items-center justify-between mb-5 md:mb-8">
                <div class="flex items-center gap-2">
                  <div class="flex items-center glass-card px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl">
                    <div
                      class="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full mr-2 md:mr-3 shadow-[0_0_10px_currentColor]"
                      :class="product.stock > 0 ? 'bg-green-400 text-green-400' : 'bg-red-500 text-red-500'"
                    ></div>
                    <span
                      class="text-xs md:text-sm font-semibold tracking-wide uppercase"
                      :class="product.stock > 0 ? 'text-green-300' : 'text-red-300'"
                    >
                      {{ product.stock > 0 ? 'Skladem' : 'Vyprodáno' }}
                    </span>
                  </div>
                  <button
                    @click="toggleFavorite"
                    :disabled="isTogglingFavorite"
                    class="flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300"
                    :class="isFavorite
                      ? 'border-secondary-500/50 bg-secondary-500/20 text-secondary-400'
                      : 'border-white/10 hover:border-secondary-500/30 text-white/50 hover:text-secondary-400'"
                    :title="isFavorite ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'"
                  >
                    <Icon v-if="isTogglingFavorite" icon="lucide:loader-2" class="animate-spin" height="20" />
                    <Icon v-else :icon="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" height="22" />
                  </button>
                </div>
                <span class="text-[10px] md:text-xs font-mono text-white/20 uppercase tracking-widest">ID: {{ product.id }}</span>
              </div>

              <button
                type="button"
                @click="addToCart"
                class="w-full flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 text-base md:text-lg font-bold rounded-xl md:rounded-2xl transition-all duration-300 focus:outline-none"
                :disabled="product.stock <= 0"
                :class="product.stock > 0
                  ? 'btn-cosmic'
                  : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'"
              >
                <Icon icon="mdi:cart-plus" height="22" />
                {{ product.stock > 0 ? 'Přidat do košíku' : 'Nedostupné' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recenze -->
      <div class="glass-card-strong p-6 md:p-8 mt-8">
        <h2 class="text-xl font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center gap-2">
          <Icon icon="mdi:star-outline" class="text-primary-400" height="24" />
          Recenze ({{ productReviews?.length ?? 0 }})
        </h2>

        <!-- Formulář pro přihlášené -->
        <div class="mb-8 p-5 rounded-xl bg-white/5 border border-white/10">
          <h3 class="text-sm font-semibold text-white mb-4">Napsat recenzi</h3>
          <form @submit.prevent="submitReview" class="space-y-4">
            <div>
              <label class="block text-xs text-white/50 mb-2">Hodnocení</label>
              <div class="flex gap-1">
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  @click="reviewRating = n"
                  class="p-1 transition-colors"
                >
                  <Icon :icon="n <= reviewRating ? 'mdi:star' : 'mdi:star-outline'" height="24" :class="n <= reviewRating ? 'text-yellow-400' : 'text-white/30'" />
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs text-white/50 mb-2">Komentář (volitelné)</label>
              <textarea v-model="reviewComment" rows="3" placeholder="Co se vám na produktu líbilo?" class="input-cosmic w-full resize-none" />
            </div>
            <button type="submit" :disabled="isSubmittingReview" class="btn-cosmic px-6 py-2.5 flex items-center gap-2">
              <Icon v-if="isSubmittingReview" icon="lucide:loader-2" class="animate-spin" height="18" />
              <Icon v-else icon="mdi:send-outline" height="18" />
              {{ isSubmittingReview ? 'Odesílám...' : 'Odeslat recenzi' }}
            </button>
          </form>
        </div>

        <!-- Seznam recenzí -->
        <div v-if="productReviews && productReviews.length > 0" class="space-y-4">
          <div v-for="rev in productReviews" :key="rev.id" class="p-4 rounded-xl bg-white/5 border border-white/10">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-white">{{ rev.userName }}</span>
              <div class="flex text-yellow-400">
                <Icon v-for="n in 5" :key="n" :icon="n <= rev.rating ? 'mdi:star' : 'mdi:star-outline'" height="14" />
              </div>
            </div>
            <p v-if="rev.comment" class="text-sm text-white/70">&bdquo;{{ rev.comment }}&ldquo;</p>
            <div class="text-[11px] text-white/40 mt-2">{{ rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('cs-CZ') : '' }}</div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-white/50 text-sm">Zatím zde nejsou žádné recenze.</div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="glass-card-strong p-8 md:p-12 text-center">
      <div class="text-4xl md:text-5xl mb-4">🌑</div>
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-4 neon-text">Produkt nenalezen</h2>
      <p class="text-white/40 mb-6 md:mb-8 text-sm md:text-base">Tento produkt se ztratil ve vesmíru...</p>
      <NuxtLink to="/" class="btn-cosmic-outline inline-flex items-center gap-2 text-sm md:text-base">
        <Icon icon="ep:arrow-left-bold" height="16" />
        Zpět na úvod
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
