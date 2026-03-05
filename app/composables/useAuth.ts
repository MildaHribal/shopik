import { ref } from 'vue'
import { supabase } from '~~/lib/auth'

// Shared reactive state across components
const currentUser = ref<{ id: string; name: string; email: string } | null>(null)
const isAuthLoading = ref(true)

let initialized = false

async function refreshSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      currentUser.value = {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
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

    // Listen for auth state changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        currentUser.value = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          email: session.user.email || '',
        }
      } else {
        currentUser.value = null
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    currentUser.value = null
  }

  return {
    currentUser,
    isAuthLoading,
    signOut,
    refreshSession,
    supabase,
  }
}
