<script setup lang="ts">
import { useCartStore } from "~/stores/cart";
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';

const cart = useCartStore();
const isScrolled = ref(false);
const isSearchOpen = ref(false);
const isMobileMenuOpen = ref(false);

const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const isSearching = ref(false);

watch(searchQuery, async (newQuery) => {
  if (!newQuery || newQuery.length < 2) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  try {
    const res = await $fetch(`/api/products?search=${encodeURIComponent(newQuery)}`);
    searchResults.value = res as any[];
  } catch (err) {
    console.error(err);
  } finally {
    isSearching.value = false;
  }
});

const { currentUser, signOut } = useAuth();

const logout = async () => {
  await signOut();
};

// Categories from DB
const { data: categoriesData } = await useFetch<any[]>('/api/categories');

const categoryTree = computed(() => {
  if (!categoriesData.value) return [];
  
  // Custom ordering map
  const orderMap: Record<string, number> = {
    'MODA': 20,
    'BIZUTERIE': 10,
    'DOPLNKY': 30,
    'OBRAZY': 40,
    'OSTATNÍ': 50
  };

  const map = new Map();
  // First pass: create nodes
  categoriesData.value.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] });
  });
  
  const tree: any[] = [];
  // Second pass: link parents/children
  categoriesData.value.forEach(cat => {
    const node = map.get(cat.id);
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      tree.push(node);
    }
  });

  // Sort top-level categories by custom map
  return tree.sort((a, b) => {
    const orderA = orderMap[a.name] || 999;
    const orderB = orderMap[b.name] || 999;
    return orderA - orderB;
  });
});

// For mobile menu tracking
const expandedMobileCats = ref<Set<number>>(new Set());
const toggleMobileCat = (id: number) => {
  if (expandedMobileCats.value.has(id)) {
    expandedMobileCats.value.delete(id);
  } else {
    expandedMobileCats.value.add(id);
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

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
    <div class="hidden md:flex flex-grow justify-center mx-4">
      <div class="flex items-center gap-1">
        <div
          v-for="cat in categoryTree"
          :key="cat.id"
          class="relative group"
        >
          <NuxtLink
            :to="`/category/${cat.slug}`"
            class="nav-link px-4 py-2.5 rounded-full text-sm font-semibold text-white/60 transition-all duration-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5"
          >
            <span>{{ cat.name }}</span>
            <Icon v-if="cat.children.length > 0" name="heroicons:chevron-down" class="w-3.5 h-3.5 opacity-40 group-hover:rotate-180 transition-transform duration-300" />
            <span class="nav-link-glow"></span>
          </NuxtLink>

          <!-- Level 2 Dropdown -->
          <div v-if="cat.children.length > 0" class="dropdown-container">
            <div class="dropdown-menu">
              <div v-for="sub in cat.children" :key="sub.id" class="relative group/sub">
                <NuxtLink
                  :to="`/category/${sub.slug}`"
                  class="dropdown-item"
                >
                  <span class="text-sm font-medium">{{ sub.name }}</span>
                  <Icon v-if="sub.children.length > 0" name="heroicons:chevron-right" class="w-3.5 h-3.5 opacity-40" />
                </NuxtLink>

                <!-- Level 3 Flyout -->
                <div v-if="sub.children.length > 0" class="submenu-container">
                  <div class="dropdown-menu">
                    <NuxtLink
                      v-for="third in sub.children"
                      :key="third.id"
                      :to="`/category/${third.slug}`"
                      class="dropdown-item"
                    >
                      <span class="text-sm font-medium">{{ third.name }}</span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center space-x-3 md:space-x-4">
      <button @click="isSearchOpen = true" class="nav-action-btn" title="Hledat">
        <Icon name="iconamoon:search-fill" height="20" />
      </button>

      <div class="flex items-center gap-1.5 md:gap-2 relative">
        <NuxtLink 
          :to="currentUser ? '/user' : '/user/login'" 
          class="nav-action-btn" 
          title="Můj profil"
          aria-label="Můj profil"
        >
          <Icon name="bxs:user" height="20" />
        </NuxtLink>
      </div>

      <NuxtLink to="/cart" class="nav-action-btn relative" title="Košík" aria-label="Košík">
        <Icon name="mdi:cart" height="20" />
        <span v-if="cart.itemCount > 0" class="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg shadow-primary-500/30">
          {{ cart.itemCount }}
        </span>
      </NuxtLink>

      <!-- Mobile menu toggle -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="nav-action-btn flex md:!hidden" title="Menu">
        <Icon :name="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" height="26" />
      </button>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        @click="isMobileMenuOpen = false"
        class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm md:hidden"
      ></div>
    </Transition>

    <Transition name="slide-mobile">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-y-0 left-0 z-[101] w-80 bg-[#0d0020] border-r border-white/10 flex flex-col md:hidden"
      >
        <div class="p-6 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔮</span>
            <span class="text-xl font-bold neon-text-rainbow">Shopik</span>
          </div>
          <button @click="isMobileMenuOpen = false" class="text-white/40">
            <Icon name="mdi:close" height="24" />
          </button>
        </div>

        <div class="flex-grow overflow-y-auto py-6 px-4">
          <div class="mb-8">
            <h3 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Kategorie</h3>
            <div class="space-y-1">
              <div v-for="cat in categoryTree" :key="cat.id">
                <div class="flex items-center justify-between">
                  <NuxtLink
                    :to="`/category/${cat.slug}`"
                    @click="isMobileMenuOpen = false"
                    class="flex-grow flex items-center px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span class="text-lg mr-3">🌀</span>
                    <span class="font-medium">{{ cat.name }}</span>
                  </NuxtLink>
                  <button 
                    v-if="cat.children.length > 0"
                    @click="toggleMobileCat(cat.id)"
                    class="p-4 text-white/30"
                  >
                    <Icon :name="expandedMobileCats.has(cat.id) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
                  </button>
                </div>

                <!-- Mobile Subcategories -->
                <div v-if="expandedMobileCats.has(cat.id) && cat.children.length > 0" class="ml-8 space-y-1 border-l border-white/10 pl-2">
                  <div v-for="sub in cat.children" :key="sub.id">
                    <div class="flex items-center justify-between">
                      <NuxtLink
                        :to="`/category/${sub.slug}`"
                        @click="isMobileMenuOpen = false"
                        class="flex-grow px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5"
                      >
                        {{ sub.name }}
                      </NuxtLink>
                      <button 
                        v-if="sub.children.length > 0"
                        @click="toggleMobileCat(sub.id)"
                        class="p-2 text-white/20"
                      >
                        <Icon :name="expandedMobileCats.has(sub.id) ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
                      </button>
                    </div>

                    <div v-if="expandedMobileCats.has(sub.id) && sub.children.length > 0" class="ml-4 space-y-1 border-l border-white/10 pl-2">
                      <NuxtLink
                        v-for="third in sub.children"
                        :key="third.id"
                        :to="`/category/${third.slug}`"
                        @click="isMobileMenuOpen = false"
                        class="block px-4 py-1.5 rounded-lg text-xs text-white/40 hover:text-white"
                      >
                        {{ third.name }}
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 ml-4">Můj účet</h3>
            <div class="space-y-1">
              <NuxtLink v-if="!currentUser" to="/user/login" @click="isMobileMenuOpen = false" class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:bg-white/5">
                <Icon name="mdi:login" class="mr-3 text-lg" />
                <span>Přihlásit se</span>
              </NuxtLink>
              <template v-else>
                <NuxtLink to="/user" @click="isMobileMenuOpen = false" class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:bg-white/5">
                  <Icon name="mdi:account-circle" class="mr-3 text-lg" />
                  <span>Můj profil</span>
                </NuxtLink>
                <NuxtLink to="/admin" @click="isMobileMenuOpen = false" class="flex items-center px-4 py-3 rounded-xl text-white/70 hover:bg-white/5">
                  <Icon name="mdi:cog" class="mr-3 text-lg" />
                  <span>Admin Panel</span>
                </NuxtLink>
                <button @click="logout(); isMobileMenuOpen = false" class="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10">
                  <Icon name="mdi:logout" class="mr-3 text-lg" />
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
        <Icon name="iconamoon:search-fill" height="18" />
      </button>

      <div class="pointer-events-auto">
        <NuxtLink 
          :to="currentUser ? '/user' : '/user/login'" 
          class="floating-btn" 
          title="Můj profil"
          aria-label="Můj profil"
        >
          <Icon name="bxs:user" height="18" />
        </NuxtLink>
      </div>

      <NuxtLink to="/cart" class="pointer-events-auto floating-btn relative" title="Košík" aria-label="Košík">
        <Icon name="mdi:cart-outline" height="18" />
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
            <Icon name="mdi:close" height="24" />
          </button>
        </div>

        <div class="p-5 md:p-6 flex-grow flex flex-col">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Icon name="iconamoon:search-fill" class="text-white/30 group-focus-within:text-primary-400 transition-colors" height="20" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Co hledáte? ✨"
              autofocus
              class="input-cosmic w-full pl-12 py-4 text-lg"
            />
          </div>

          <!-- Výsledky hledání -->
          <div v-if="searchQuery.length > 1" class="mt-6 flex flex-col gap-2 overflow-y-auto max-h-[60vh] scrollbar-hide">
            
            <div v-if="isSearching" class="text-center text-white/50 py-8 flex flex-col items-center">
              <Icon name="lucide:loader-2" class="animate-spin text-3xl mb-2 text-primary-400" />
              <span>Hledám ve hvězdách...</span>
            </div>
            
            <div v-else-if="searchResults.length === 0" class="text-center text-white/50 py-8">
               Nic jsme nenašli pro <strong>"{{ searchQuery }}"</strong> 🪐
            </div>
            
            <div v-else class="space-y-2">
              <NuxtLink 
                v-for="prod in searchResults" 
                :key="prod.id" 
                :to="'/product/' + prod.slug"
                @click="isSearchOpen = false; searchQuery = ''"
                class="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary-500/30 transition-all group backdrop-blur-sm cursor-pointer"
              >
                <div class="w-14 h-14 rounded-lg bg-black/40 overflow-hidden flex-shrink-0 relative">
                  <NuxtImg
                    v-if="prod.image"
                    :src="prod.image.startsWith('http') ? prod.image : `/${prod.image}`"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    width="64"
                    height="64"
                  />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-white font-medium truncate group-hover:text-primary-300 transition-colors">{{ prod.title }}</span>
                  <span class="text-primary-400 font-black tracking-wide">{{ prod.price }} Kč</span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div v-else class="mt-12 text-center text-white/20 flex flex-col items-center">
            <Icon name="solar:planet-3-line-duotone" height="64" class="mb-4 opacity-50" />
            <p>Napište název produktu...</p>
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

/* Flyout Menu Styles */
.dropdown-container {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding-top: 0.75rem;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 60;
}

.group:hover .dropdown-container {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-menu {
  background: #1a0225; /* Very dark purple */
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1rem;
  min-width: 220px;
  padding: 0.5rem;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(20px);
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: rgba(139, 92, 246, 0.1);
  color: #fff;
}

.submenu-container {
  position: absolute;
  top: -0.5rem;
  left: 100%;
  padding-left: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transform: translateX(10px);
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}

.group\/sub:hover > .submenu-container {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
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