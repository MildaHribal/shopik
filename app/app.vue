<script setup lang="ts">
useHead({
    htmlAttrs: {
        lang: 'cs',
    },
    meta: [
        { name: 'theme-color', content: '#0d0020' },
    ]
})
</script>
<template>
    <UApp>
        <ToastHost />
        <NuxtLoadingIndicator color="repeating-linear-gradient(to right, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%)" :height="4" :throttle="80" />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>
