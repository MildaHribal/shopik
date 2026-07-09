import { useAuth } from "~/composables/useAuth";

/**
 * Route middleware for /admin/**.
 * Requires an authenticated session with role === 'admin'.
 * Non-admins are redirected: unauth → /user/login, auth-but-not-admin → /.
 */
export default defineNuxtRouteMiddleware(async () => {
  const { currentUser, refreshSession, isAuthLoading } = useAuth();

  // /admin is client-rendered (ssr:false). ALWAYS resolve the session before
  // deciding — the old code only awaited when isAuthLoading was still true, so on
  // slower connections (typically mobile) the middleware ran after loading had
  // flipped to false but before currentUser was populated, and bounced to login.
  if (import.meta.client && (isAuthLoading.value || !currentUser.value)) {
    await refreshSession();
  }

  const user = currentUser.value as any;
  if (!user) {
    return navigateTo('/user/login');
  }
  if (user.role !== 'admin') {
    return navigateTo('/');
  }
});
