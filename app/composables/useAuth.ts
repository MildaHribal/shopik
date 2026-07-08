import { ref } from 'vue'
import { authClient } from '~~/lib/auth-client'

type AppUser = { id: string; name: string; email: string; role: string }

const currentUser = ref<AppUser | null>(null)
const isAuthLoading = ref(true)
let initialized = false

async function fetchSession() {
  try {
    const client = authClient()
    const { data } = await client.getSession()
    if (data?.user) {
      currentUser.value = {
        id: data.user.id,
        name: data.user.name || '',
        email: data.user.email || '',
        role: (data.user as any).role || 'user',
      }
    } else {
      currentUser.value = null
    }
  } catch (err) {
    currentUser.value = null
  } finally {
    isAuthLoading.value = false
  }
}

export function useAuth() {
  if (!initialized && import.meta.client) {
    initialized = true
    fetchSession()
  }

  const client = authClient()

  const signInWithPassword = async (email: string, password: string) => {
    const res = await client.signIn.email({ email, password })
    if (res.error) {
      return { error: res.error.message || 'Nesprávný email nebo heslo.' }
    }
    await fetchSession()
    return { error: null }
  }

  const signUpWithPassword = async (email: string, password: string) => {
    const name = email.split('@')[0] || email
    const res = await client.signUp.email({ email, password, name })
    if (res.error) {
      const msg = res.error.message || ''
      if (/exist|already|in use/i.test(msg)) {
        return { error: 'Uživatel s tímto emailem již existuje.' }
      }
      return { error: msg || 'Nastala chyba při registraci.' }
    }
    await fetchSession()
    return { error: null }
  }

  const signInWithGoogle = async () => {
    try {
      const res = await client.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
      if (res?.error) {
        return { error: res.error.message || 'Google OAuth není dostupné.' }
      }
      return { error: null }
    } catch (e: any) {
      return { error: 'Google OAuth není nastavené. Doplň GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET v .env.' }
    }
  }

  const signOut = async () => {
    await client.signOut()
    currentUser.value = null
  }

  // Sends a reset link to the given email. Always resolves without error to the
  // caller (we don't reveal whether an account exists).
  const requestPasswordReset = async (email: string) => {
    try {
      const res = await client.requestPasswordReset({ email, redirectTo: '/user/reset-password' })
      if ((res as any)?.error) {
        return { error: (res as any).error.message || 'Nepodařilo se odeslat email.' }
      }
      return { error: null }
    } catch (e: any) {
      return { error: 'Nepodařilo se odeslat email. Zkuste to prosím znovu.' }
    }
  }

  // Completes the reset using the token from the email link.
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await client.resetPassword({ token, newPassword })
      if ((res as any)?.error) {
        return { error: (res as any).error.message || 'Odkaz je neplatný nebo vypršel.' }
      }
      return { error: null }
    } catch (e: any) {
      return { error: 'Odkaz je neplatný nebo vypršel. Požádejte o nový.' }
    }
  }

  return {
    currentUser,
    isAuthLoading,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
    requestPasswordReset,
    resetPassword,
    refreshSession: fetchSession,
  }
}
