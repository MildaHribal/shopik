<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  categoryTree: any[],
  currentSlug: string | null
}>()

// Helper to check if a category or its children contains the current slug
const isActiveBranch = (cat: any): boolean => {
  if (cat.slug === props.currentSlug) return true
  if (cat.children && cat.children.length > 0) {
    return cat.children.some((child: any) => isActiveBranch(child))
  }
  return false
}
</script>

<template>
  <aside class="w-64 flex-shrink-0 pr-6 pl-4">
    <div class="glass-card p-5 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      <h3 class="font-bold text-lg mb-5 text-white neon-text flex items-center gap-2">
        <span>🌌</span>
        <span>Kolekce</span>
      </h3>
      <nav>
        <ul class="space-y-1.5">
          <li>
            <NuxtLink
              to="/category/vsechny"
              class="w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium block"
              :class="currentSlug === 'vsechny' || !currentSlug
                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'"
            >
              ✨ Všechny produkty
            </NuxtLink>
          </li>
          
          <li v-for="cat in categoryTree" :key="cat.id" class="mt-2 text-sm font-medium">
            <div class="mb-1">
              <NuxtLink
                :to="`/category/${cat.slug}`"
                class="w-full flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group"
                :class="cat.slug === currentSlug
                  ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                  : isActiveBranch(cat) 
                    ? 'text-primary-300 bg-white/5 font-semibold' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'"
              >
                <!-- Prefix icon/emoji if top-level -->
                <Icon v-if="cat.children.length > 0" :name="isActiveBranch(cat) ? 'heroicons:chevron-down' : 'heroicons:chevron-right'" class="mr-2 opacity-50 transition-transform group-hover:text-primary-400" />
                <span v-else class="mr-2 text-xs opacity-50">✨</span>
                {{ cat.name }}
              </NuxtLink>
            </div>
            
            <!-- Children (Level 2) -->
            <ul v-if="cat.children.length > 0 && isActiveBranch(cat)" class="ml-4 space-y-1 border-l border-white/10 pl-2">
              <li v-for="sub in cat.children" :key="sub.id">
                <NuxtLink
                  :to="`/category/${sub.slug}`"
                  class="w-full flex items-center px-3 py-2 rounded-lg transition-all duration-300 text-[13px] group"
                  :class="sub.slug === currentSlug
                    ? 'bg-primary-500/20 text-white border border-primary-500/30'
                    : isActiveBranch(sub)
                      ? 'text-primary-300 bg-white/5'
                      : 'text-white/50 hover:text-white hover:bg-white/5'"
                >
                  <Icon v-if="sub.children.length > 0" :name="isActiveBranch(sub) ? 'heroicons:chevron-down' : 'heroicons:chevron-right'" class="mr-1.5 opacity-50 transition-transform group-hover:text-primary-400 w-3 h-3" />
                  {{ sub.name }}
                </NuxtLink>
                
                <!-- Children (Level 3) -->
                <ul v-if="sub.children.length > 0 && isActiveBranch(sub)" class="ml-4 space-y-1 border-l border-white/10 pl-2 mt-1">
                  <li v-for="third in sub.children" :key="third.id">
                    <NuxtLink
                      :to="`/category/${third.slug}`"
                      class="w-full block px-3 py-1.5 rounded-md transition-all duration-300 text-xs"
                      :class="third.slug === currentSlug
                        ? 'text-white font-semibold bg-white/10'
                        : 'text-white/40 hover:text-white hover:bg-white/5'"
                    >
                      {{ third.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>