import { ref } from 'vue'
import { getSupabase } from '~~/lib/auth'
import { useCookie } from '#app'

// Shared reactive state across components
const currentUser = ref<{ id: string; name: string; email: string } | null>(null)
const isAuthLoading = ref(true)

let initialized = false

function updateTokenCookie(token: string | null) {
  const tokenCookie = useCookie('sb-access-token', {
    maxAge: 604800, // 7 days
    sameSite: 'lax',
    secure: window?.location?.protocol === 'https:',
    path: '/'
  })
  tokenCookie.value = token || null
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
