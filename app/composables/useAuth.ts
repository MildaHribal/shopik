import { ref, onMounted } from 'vue'
import { authClient } from '~~/lib/auth'

// Shared reactive state across components
const currentUser = ref<{ id: string; name: string; email: string } | null>(null)
const isAuthLoading = ref(true)

let initialized = false

async function refreshSession() {
  try {
    const result = await authClient.getSession()
    const session = 'data' in result ? result.data : result
    if (session?.user) {
      currentUser.value = {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
      }
    } else {
      currentUser.value = null
    }
  } catch {
    currentUser.value = null
  } finally {
    isAuthLoading.value = false
  }
}

export function useAuth() {
  if (!initialized && import.meta.client) {
    initialized = true
    refreshSession()
  }

  const signOut = async () => {
    await authClient.signOut()
    currentUser.value = null
  }

  return {
    currentUser,
    isAuthLoading,
    signOut,
    refreshSession,
  }
}
