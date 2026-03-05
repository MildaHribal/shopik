import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, refreshSession } = useAuth();

  // If we already have a user, allow navigation
  if (currentUser.value) {
    return;
  }

  // If not, try to refresh session (client-side) or check API (server/client)
  if (import.meta.client) {
    await refreshSession();
    if (currentUser.value) return;
  }

  // Fallback to API check (needed for SSR and reliable check)
  try {
    const user = await $fetch('/api/user/profile');
    if (user) {
      // Update local state if successful
      currentUser.value = {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email
      };
      return;
    }
  } catch (error: any) {
    // Only redirect if explicitly unauthorized
    if (error.statusCode === 401 || error.response?.status === 401) {
      return navigateTo('/user/login');
    }
    // For other errors (500, network), we might want to allow or show error page
    // But for now, let's assume if profile fetch fails, we are not logged in
    console.error('Auth check failed:', error);
    return navigateTo('/user/login');
  }
});
