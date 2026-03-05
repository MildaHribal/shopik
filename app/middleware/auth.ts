export default defineNuxtRouteMiddleware(async () => {
  try {
    await $fetch('/api/user/profile')
    // Uživatel je přihlášen
  } catch {
    // Jakákoliv chyba (401, 404, nedostupná auth služba…) → přesměrovat na login
    return navigateTo('/user/login')
  }
})
