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
  <aside class="w-64 flex-shrink-0 pr-8 border-r border-gray-200 dark:border-gray-700">
    <h3 class="font-bold text-xl mb-6 text-gray-900 dark:text-white">Kategorie</h3>
    <nav>
      <ul class="space-y-2">
        <li>
          <button
              @click="$emit('select', null)"
              class="w-full text-left px-4 py-2 rounded-lg transition-colors"
              :class="selectedCategory === null ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'"
          >
            Všechny produkty
          </button>
        </li>
        <li v-for="category in categories" :key="category">
          <button
              @click="$emit('select', category)"
              class="w-full text-left px-4 py-2 rounded-lg transition-colors"
              :class="selectedCategory === category ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'"
          >
            {{ category }}
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>

</style>