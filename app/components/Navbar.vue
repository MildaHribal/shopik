<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { Icon } from "@iconify/vue";
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';

const cart = useCartStore();
const isScrolled = ref(false);
const isSearchOpen = ref(false);
const isMobileMenuOpen = ref(false);

const { currentUser, signOut: authSignOut } = useAuth();

const navLinks = [
  { label: 'emzáci', link: '#' },
  { label: 'devky', link: '#' },
  { label: 'anime/hentai', link: '#' },
  { label: 'zvířátka', link: '#' },
  { label: 'ostatní', link: '#' }
];

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

const logout = async () => {
  await authSignOut();
};

const userMenuItems = [
  [
    {
      label: 'Můj profil',
      icon: 'i-heroicons-user',
      to: '/user'
    },
    {
      label: 'Admin panel',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/admin'
    },
    {
      label: 'Odhlásit se',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: logout
    }
  ]
]

watch(isSearchOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

watch(isMobileMenuOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll);
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
})
</script>

<template>
  <!-- Main Navbar -->
  <nav class="navbar-main w-full flex items-center justify-between px-4 md:px-6 py-4 top-0 z-50">
    <!-- Brand -->
    <div class="flex items-center gap-2">
      <span class="text-lg md:text-xl hippie-float">🔮</span>
      <NuxtLink to="/" class="text-xl md:text-2xl font-bold tracking-tight transition-all duration-300 hover:scale-105 neon-text-rainbow">
        Shopik
      </NuxtLink>
    </div>

    <!-- Desktop Nav Links -->
    <div class="hidden lg:flex flex-grow justify-center mx-4">
      <div class="flex items-center gap-1">
        <button
          v-for="item in navLinks"
          :key="item.label"
          class="nav-link group relative px-5 py-2.5 overflow-hidden rounded-full text-sm font-semibold text-white/60 transition-all duration-300 hover:text-white hover:bg-white/5"
        >
          <span class="relative z-10">{{ item.label }}</span>
          <span class="nav-link-glow"></span>
        </button>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-3 md:space-x-4">
      <button @click="isSearchOpen = true" class="nav-action-btn" title="Hledat">
        <Icon icon="iconamoon:search-fill" height="20" />
      </button>

      <div class="flex items-center gap-1.5 md:gap-2">
        <NuxtLink v-if="currentUser" to="/user" class="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-full text-[10px] md:text-xs font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/40 transition-all duration-300" title="Můj účet">
          <Icon icon="mdi:account-circle-outline" class="text-sm md:text-base" />
          <span class="hidden sm:inline">Můj účet</span>
        </NuxtLink>
        <UDropdownMenu v-if="currentUser" :items="userMenuItems" :content="{ align: 'end' }">
          <button class="nav-action-btn" title="User Menu">
            <Icon icon="bxs:user" height="20" />
          </button>
        </UDropdownMenu>
        <NuxtLink v-else to="/user/login" class="nav-action-btn" title="Login">
          <Icon icon="bxs:user" height="20" />
        </NuxtLink>
      </div>

      <NuxtLink to="/cart" class="nav-action-btn relative" title="Košík">
        <Icon icon="mdi:cart" height="20" />
        <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg shadow-primary-500/30">
          {{ cart.itemCount }}
        </span>
      </NuxtLink>

      <!-- Mobile menu toggle -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="nav-action-btn flex lg:hidden" title="Menu">
        <Icon :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" height="26" />
      </button>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        @click="isMobileMenuOpen = false"
        class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden"
      ></div>
    </Transition>

    <Transition name="slide-mobile">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 left-0 z-[101] w-80 bg-[#0d0020] border-r border-white/10 flex flex-col lg:hidden"
      >
        <div class="p-6 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔮</span>
            <span class="text-xl font-bold neon-text-rainbow">Shopik</span>
          </div>
          <button @click="isMobileMenuOpen = false" class="text-white/40">
            <Icon icon="mdi:close" height="24" />
          </button>
        </div>

        <div class="flex-grow overflow-y-auto py-6 px-4">
          <div class="mb-8">
            <h3 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Kategorie</h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navLinks"
                :key="item.label"
                to="/"
                @click="isMobileMenuOpen = false"
                class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                <span class="text-lg mr-3">🌀</span>
                <span class="font-medium">{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <div>
            <h3 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Můj účet</h3>
            <div class="space-y-1">
              <NuxtLink v-if="!currentUser" to="/user/login" @click="isMobileMenuOpen = false" class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:bg-white/5">
                <Icon icon="mdi:login" class="mr-3 text-lg" />
                <span>Přihlásit se</span>
              </NuxtLink>
              <template v-else>
                <NuxtLink to="/user" @click="isMobileMenuOpen = false" class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:bg-white/5">
                  <Icon icon="mdi:account-circle" class="mr-3 text-lg" />
                  <span>Můj profil</span>
                </NuxtLink>
                <NuxtLink to="/admin" @click="isMobileMenuOpen = false" class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:bg-white/5">
                  <Icon icon="mdi:cog" class="mr-3 text-lg" />
                  <span>Admin Panel</span>
                </NuxtLink>
                <button @click="logout(); isMobileMenuOpen = false" class="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10">
                  <Icon icon="mdi:logout" class="mr-3 text-lg" />
                  <span>Odhlásit se</span>
                </button>
              </template>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-white/5 text-center">
          <p class="text-[10px] text-white/20 font-medium">☮ TRIPIER THAN EVER 2026 ☮</p>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Floating Navbar on Scroll -->
  <Transition name="navbar">
    <div v-if="isScrolled" class="fixed top-4 right-4 z-40 flex items-center space-x-2 md:space-x-3 pointer-events-none">
      <button @click="isSearchOpen = true" class="pointer-events-auto floating-btn" title="Search">
        <Icon icon="iconamoon:search-fill" height="18" />
      </button>

      <div class="pointer-events-auto">
        <UDropdownMenu v-if="currentUser" :items="userMenuItems" :content="{ align: 'end' }">
          <button class="floating-btn" title="User Menu">
            <Icon icon="bx:user" height="18" />
          </button>
        </UDropdownMenu>
        <NuxtLink v-else to="/user/login" class="floating-btn" title="Login">
          <Icon icon="bx:user" height="18" />
        </NuxtLink>
      </div>

      <NuxtLink to="/cart" class="pointer-events-auto floating-btn relative" title="Cart">
        <Icon icon="mdi:cart-outline" height="18" />
        <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full">
          {{ cart.itemCount }}
        </span>
      </NuxtLink>
    </div>
  </Transition>

  <!-- Search Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isSearchOpen"
        @click="isSearchOpen = false"
        class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md"
      ></div>
    </Transition>

    <Transition name="slide">
      <div
        v-if="isSearchOpen"
        class="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#0d0020]/95 backdrop-blur-xl shadow-2xl border-l border-primary-500/20 flex flex-col"
      >
        <div class="flex items-center justify-between p-5 md:p-6 border-b border-white/5">
          <h2 class="text-lg md:text-xl font-bold text-white neon-text">🔍 Vyhledávání</h2>
          <button
            @click="isSearchOpen = false"
            class="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Icon icon="mdi:close" height="24" />
          </button>
        </div>

        <div class="p-5 md:p-6 flex-grow">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Icon icon="iconamoon:search-fill" class="text-white/30 group-focus-within:text-primary-400 transition-colors" height="20" />
            </div>
            <input
              type="text"
              placeholder="Co hledáte? ✨"
              autofocus
              class="input-cosmic pl-12 py-4 text-lg"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.nav-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.nav-action-btn:hover {
  color: white;
  background: rgba(139, 92, 246, 0.15);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
  transform: scale(1.1);
}

.nav-link-glow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-link:hover .nav-link-glow {
  opacity: 1;
}

.floating-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 0, 32, 0.85);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  padding: 0.6rem;
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  cursor: pointer;
}

@media (min-width: 768px) {
  .floating-btn {
    padding: 0.75rem;
  }
}

.floating-btn:hover {
  color: white;
  background: rgba(13, 0, 32, 0.95);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.5), 0 0 25px rgba(139, 92, 246, 0.2);
  transform: scale(1.05);
}

/* Transitions */
.navbar-enter-active,
.navbar-leave-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.navbar-enter-from,
.navbar-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-mobile-enter-active,
.slide-mobile-leave-active {
  transition: transform 0.3s ease-out;
}
.slide-mobile-enter-from,
.slide-mobile-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>