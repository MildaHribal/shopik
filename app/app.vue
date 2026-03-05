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
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
