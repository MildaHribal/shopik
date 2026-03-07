import { ref } from 'vue'
import { getSupabase } from '~~/lib/auth'

// Shared reactive state across components
const currentUser = ref<{ id: string; name: string; email: string } | null>(null)
const isAuthLoading = ref(true)

let initialized = false

function updateTokenCookie(token: string | null) {
  if (import.meta.client) {
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
    if (token) {
      document.cookie = `sb-access-token=${token}; path=/; max-age=604800; SameSite=Lax${secureFlag}`
    } else {
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`
    }
  }
}

async function refreshSession() {
  const supabase = getSupabase()
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      currentUser.value = {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
        email: session.user.email || '',
      }
      updateTokenCookie(session.access_token)
    } else {
      currentUser.value = null
      updateTokenCookie(null)
    }
  } catch {
    currentUser.value = null
    updateTokenCookie(null)
  } finally {
    isAuthLoading.value = false
  }
}

export function useAuth() {
  const supabase = getSupabase()

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
        updateTokenCookie(session.access_token)
      } else {
        currentUser.value = null
        updateTokenCookie(null)
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    currentUser.value = null
    updateTokenCookie(null)
  }

  return {
    currentUser,
    isAuthLoading,
    signOut,
    refreshSession,
    supabase,
  }
}
