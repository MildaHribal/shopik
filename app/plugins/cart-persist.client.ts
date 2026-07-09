import { watch } from 'vue';
import { useCartStore, CART_STORAGE_KEY } from '~/stores/cart';

/**
 * Persist the cart in localStorage across reloads.
 *
 * Runs on `app:mounted` — i.e. AFTER Pinia has restored its SSR state — so the
 * loaded cart isn't overwritten by the (empty) hydrated store. Without this the
 * cart was lost on any full page reload, emptying it on the way to checkout.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const cart = useCartStore();

  nuxtApp.hook('app:mounted', () => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) cart.items = JSON.parse(saved);
    } catch {
      /* corrupt storage — ignore */
    }

    watch(
      () => cart.items,
      (val) => {
        try {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(val));
        } catch {
          /* quota / private mode — ignore */
        }
      },
      { deep: true },
    );
  });
});
