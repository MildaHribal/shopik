// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2024-07-15',
    devtools: { enabled: process.env.NODE_ENV === 'development' },

    modules: [
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/icon',
        '@nuxt/image',
    ],

    app: {
        head: {
            htmlAttrs: { lang: 'cs' },
            titleTemplate: '%s · Shopik',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'theme-color', content: '#0d0020' },
                { name: 'description', content: 'Shopik — kosmické zboží, gadgety a doplňky.' },
                { name: 'robots', content: 'index,follow,max-image-preview:large' },
            ],
        },
        pageTransition: { name: 'page', mode: 'out-in' },
        layoutTransition: { name: 'layout', mode: 'out-in' },
        viewTransition: {
            enabled: true,
            types: ['slide'],
        },
    },

    experimental: {
        defaults: {
            nuxtLink: {
                prefetch: false,
            }
        },
        viewTransition: true,
    },

    runtimeConfig: {
        public: {
            supabaseUrl: process.env.SUPABASE_URL || '',
            supabaseKey: process.env.SUPABASE_KEY || '',
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        }
    },

    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        name: 'Shopik — kosmický shop',
        description: 'Kosmické zboží, gadgety a doplňky.',
        defaultLocale: 'cs',
    },

    robots: {
        disallow: ['/admin', '/user'],
    },

    css: ['~~/assets/css/main.css'],

    image: {
        provider: 'ipx',
        format: ['webp'],
        quality: 80,
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
        }
    },

    nitro: {
        compressPublicAssets: { gzip: true, brotli: true },
        minify: true,
        /*alias: {
            debug: fileURLToPath(new URL("./server/mocks/debug.ts", import.meta.url)),
            typeorm: fileURLToPath(new URL("./server/mocks/typeorm.ts", import.meta.url)),
        },*/
        prerender: {
            crawlLinks: true,
            failOnError: false,
            routes: ["/"],
        },
    },

    routeRules: {
        '/': { swr: true },
        '/product/**': { swr: true },
        '/cart': { swr: false },
        '/checkout': { swr: false },
        '/my-account': { swr: false },
        '/user/**': { swr: false },
        '/admin/**': { ssr: false },
    },

    linkChecker: {
        failOnError: false,
    },

})
