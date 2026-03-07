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
                        <button @click="$emit('select', null)"
                            class="category-btn w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium"
                            :class="{ 'category-btn--active': selectedCategory === null }">
                            <span
                                v-if="selectedCategory === null"
                                class="category-btn__active-bg"
                                style="view-transition-name: category-pill-desktop"
                                aria-hidden="true"
                            ></span>
                            <span class="relative z-10">✨ Všechny produkty</span>
                        </button>
                    </li>
                    <li v-for="category in categories" :key="category">
                        <button @click="$emit('select', category)"
                            class="category-btn w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium"
                            :class="{ 'category-btn--active': selectedCategory === category }">
                            <span
                                v-if="selectedCategory === category"
                                class="category-btn__active-bg"
                                style="view-transition-name: category-pill-desktop"
                                aria-hidden="true"
                            ></span>
                            <span class="relative z-10">{{ category }}</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    </aside>
</template>

<style scoped>
.category-btn {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.62);
    transition:
        color 0.3s var(--ease-snappy),
        border-color 0.3s var(--ease-snappy),
        transform 0.3s var(--ease-snappy);
}

.category-btn:hover {
    color: white;
    border-color: rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.04);
}

.category-btn--active {
    color: white;
    border-color: rgba(139, 92, 246, 0.38);
    box-shadow: 0 8px 28px rgba(139, 92, 246, 0.14);
}

.category-btn__active-bg {
    position: absolute;
    inset: 2px;
    border-radius: 0.62rem;
    background: linear-gradient(120deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.32));
    border: 1px solid rgba(139, 92, 246, 0.32);
    pointer-events: none;
    z-index: 0;
}

@media (prefers-reduced-motion: reduce) {
    .category-btn {
        transition: none !important;
    }
}
</style>
