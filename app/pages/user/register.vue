<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { Icon } from '@iconify/vue'

const { refreshSession, supabase } = useAuth()
const router = useRouter()
const toast = useCosmicToast()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  error.value = ''

  if (password.value.length < 8) {
    error.value = 'Heslo musí mít alespoň 8 znaků.'
    loading.value = false
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Hesla se neshodují.'
    loading.value = false
    return
  }

  try {
    const { error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: email.value.split('@')[0] ?? email.value,
        },
      },
    })

    if (authError) {
      if (authError.message?.includes('already')) {
        error.value = 'Uživatel s tímto emailem již existuje.'
      } else {
        error.value = authError.message || 'Nastala chyba při registraci.'
      }
    } else {
      await refreshSession()
      toast.success('Registrace', 'Vítejte v naší kosmické komunitě! ✨')
      await router.push('/')
    }
  } catch (e: any) {
    console.error(e)
    error.value = 'Nastala chyba při registraci: ' + (e.message || 'Neznámá chyba')
  } finally {
    loading.value = false
  }
}

const handleGoogleRegister = async () => {
  loading.value = true
  error.value = ''

  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (authError) {
      error.value = 'Chyba při registraci přes Google: ' + authError.message
    }
  } catch (e: any) {
    console.error(e)
    error.value = 'Chyba při registraci přes Google: ' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[80vh] flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12 relative">
    <!-- Decorative elements - hidden on mobile -->
    <div class="hidden sm:block absolute top-16 right-16 text-4xl hippie-float opacity-10">🍄</div>
    <div class="hidden sm:block absolute bottom-16 left-16 text-3xl hippie-float-delayed opacity-10">🌌</div>
    <div class="hidden sm:block absolute top-1/4 left-10 text-2xl hippie-float opacity-10">🔮</div>

    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="text-4xl md:text-5xl mb-3 md:mb-4">🌀</div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-white neon-text-pink">Registrace</h2>
        <p class="mt-1 md:mt-2 text-white/30 text-xs md:text-sm">Připojte se ke kosmické komunitě</p>
      </div>

      <!-- Form Card -->
      <div class="glass-card-strong p-5 md:p-8 gradient-border">
        <form class="space-y-5" @submit.prevent="handleRegister">
          <div>
            <label for="email" class="block text-sm font-medium text-white/60 mb-2">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="input-cosmic"
              placeholder="vas@email.cz"
            >
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-white/60 mb-2">Heslo</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="input-cosmic"
              placeholder="••••••••"
            >
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-white/60 mb-2">Potvrdit heslo</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              name="confirm-password"
              type="password"
              autocomplete="new-password"
              required
              class="input-cosmic"
              placeholder="••••••••"
            >
          </div>

          <div v-if="error" class="glass-card p-3 border-red-500/30 text-center">
            <p class="text-red-400 text-sm">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn-cosmic w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon v-if="loading" icon="mdi:loading" class="animate-spin" height="20" />
            {{ loading ? 'Registrace...' : 'Registrovat se 🌌' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="cosmic-divider"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="px-4 text-sm text-white/30 bg-[#0d0020]">nebo pokračujte přes</span>
          </div>
        </div>

        <!-- Social Login -->
        <button
          @click="handleGoogleRegister"
          :disabled="loading"
          type="button"
          class="w-full flex items-center justify-center gap-3 glass-card py-3.5 text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Icon icon="logos:google-icon" class="h-5 w-5" />
          <span class="text-sm font-semibold">Google</span>
        </button>
      </div>

      <!-- Footer link -->
      <p class="mt-8 text-center text-sm text-white/30">
        Již máte účet?
        <NuxtLink to="/user/login" class="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
          Přihlaste se ✨
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>