<script setup lang="ts">
const route = useRoute();
const siteUrl = (useRuntimeConfig().public.siteUrl as string).replace(/\/$/, '');

// ── Site-wide structured data (JSON-LD) ──────────────────────────────────────
// Organization + WebSite identity injected on EVERY page so Google always knows
// the brand, logo, social profiles and search action. Uses stable @id references
// so page-level schemas (Product, Breadcrumb…) can link back to this identity.
const orgId = `${siteUrl}/#organization`;
const siteId = `${siteUrl}/#website`;

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': orgId,
  name: 'Tynky Bordel',
  alternateName: 'Týnky Bordel',
  url: `${siteUrl}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/hero/logo-mushroom.png`,
    width: 512,
    height: 512,
  },
  image: `${siteUrl}/hero/logo-mushroom.png`,
  description: 'Autorský eshop s ručně dělanými originály — obrazy, sochy a klíčenky. Každý kousek je unikát.',
  email: 'info@tynkybordel.shop',
  slogan: 'Každý kousek je jeden na světě.',
  foundingLocation: {
    '@type': 'Place',
    address: { '@type': 'PostalAddress', addressLocality: 'Praha', addressCountry: 'CZ' },
  },
  areaServed: { '@type': 'Country', name: 'Česká republika' },
  sameAs: [
    'https://www.instagram.com/tynky_bordel/',
    'https://www.instagram.com/_kristyna_aaa/',
    'https://www.tiktok.com/@_kristyna_aaa',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': siteId,
  name: 'Tynky Bordel',
  alternateName: 'Týnky Bordel',
  url: `${siteUrl}/`,
  description: 'Autorský eshop s ručně dělanými originály — obrazy, sochy, klíčenky.',
  inLanguage: 'cs-CZ',
  publisher: { '@id': orgId },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

useHead({
    htmlAttrs: {
        lang: 'cs',
    },
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} · Tynky Bordel` : 'Tynky Bordel — ručně dělané originály';
    },
    meta: [
        { name: 'theme-color', content: '#0d0020' },
    ],
    link: [
        { rel: 'icon', type: 'image/webp', href: '/logo.webp' },
    ],
    script: [
        { type: 'application/ld+json', innerHTML: JSON.stringify(organizationSchema) },
        { type: 'application/ld+json', innerHTML: JSON.stringify(websiteSchema) },
    ],
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
