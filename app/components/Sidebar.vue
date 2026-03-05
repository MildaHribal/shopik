<script setup lang="ts">
defineProps<{
  categories: string[],
  selectedCategory: string | null
}>()

defineEmits<{
  (e: 'select', category: string | null): void
}>()
</script>

<template>
  <aside class="w-64 flex-shrink-0 pr-6 pl-4">
    <div class="glass-card p-5 sticky top-6">
      <h3 class="font-bold text-lg mb-5 text-white neon-text flex items-center gap-2">
        <span>🌌</span>
        <span>Kategorie</span>
      </h3>
      <nav>
        <ul class="space-y-1.5">
          <li>
            <button
              @click="$emit('select', null)"
              class="w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium"
              :class="selectedCategory === null
                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'"
            >
              ✨ Všechny produkty
            </button>
          </li>
          <li v-for="category in categories" :key="category">
            <button
              @click="$emit('select', category)"
              class="w-full text-left px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium"
              :class="selectedCategory === category
                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'"
            >
              {{ category }}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
</style>