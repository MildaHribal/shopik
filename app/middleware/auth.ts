import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, refreshSession, supabase } = useAuth();

  // If we already have a user, allow navigation
  if (currentUser.value) {
    return;
  }

  // If not, try to refresh session (client-side)
  if (import.meta.client) {
    await refreshSession();
    if (currentUser.value) return;
  }

  // Fallback to API check with Supabase token
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return navigateTo('/user/login');
    }

    const user = await $fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    if (user) {
      currentUser.value = {
        id: (user as any).supabaseAuthId || (user as any).id,
        name: (user as any).name,
        email: (user as any).email
      };
      return;
    }
  } catch (error: any) {
    if (error.statusCode === 401 || error.response?.status === 401) {
      return navigateTo('/user/login');
    }
    console.error('Auth check failed:', error);
    return navigateTo('/user/login');
  }
});
