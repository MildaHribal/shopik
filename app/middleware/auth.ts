import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  const { currentUser, refreshSession, isAuthLoading } = useAuth();

  if (currentUser.value) return;

  if (import.meta.client) {
    if (isAuthLoading.value) await refreshSession();
    if (currentUser.value) return;
  }

  return navigateTo('/user/login');
});
