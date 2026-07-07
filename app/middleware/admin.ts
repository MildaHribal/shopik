import { useAuth } from "~/composables/useAuth";

/**
 * Route middleware for /admin/**.
 * Requires an authenticated session with role === 'admin'.
 * Non-admins are redirected: unauth → /user/login, auth-but-not-admin → /.
 */
export default defineNuxtRouteMiddleware(async () => {
  const { currentUser, refreshSession, isAuthLoading } = useAuth();

  // Refresh session client-side if we don't yet have a user.
  if (!currentUser.value && import.meta.client) {
    if (isAuthLoading.value) await refreshSession();
  }

  const user = currentUser.value as any;
  if (!user) {
    return navigateTo('/user/login');
  }
  if (user.role !== 'admin') {
    return navigateTo('/');
  }
});
