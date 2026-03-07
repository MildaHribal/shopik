export default defineNuxtRouteMiddleware((to) => {
  const { userId } = useAuth()

  if (!userId.value) {
    return navigateTo('/user/login')
  }
})
