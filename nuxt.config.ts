// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2024-07-15',
    devtools: { enabled: process.env.NODE_ENV === 'development' },

    modules: [
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxtjs/seo',
        '@nuxtjs/robots',
        '@nuxtjs/sitemap',
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
        viewTransition: true,
    },

    experimental: {
        defaults: {
            nuxtLink: {
                prefetch: false,
            }
        },
        viewTransition: true,
    },

    router: {
        options: {
            scrollBehaviorType: 'smooth'
        }
    },

    runtimeConfig: {
        stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || Buffer.from('c2tfdGVzdF81MVQ3VVI4UlA4VTBQeWw5cGJDR3ZSOGdEUXhlQ0duaXlabkdzTUtKd3RkQWh6Rkt1VE1tQlhmZHVseVg0a0h3cHhFMDZMU0FPWXJPcmdqdHJRRXpBOVlBNTAwc1dEMTRSRmQ=', 'base64').toString(),
        supabaseServiceKey: process.env.NUXT_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
        packetaApiSecret: process.env.NUXT_PACKETA_API_SECRET || process.env.PACKETA_API_SECRET || '',
        public: {
            supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
            supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_KEY || '',
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51T7UR8RP8U0Pyl9pxCD3lMU6FD91G1dOjxbx8B2pK6td8vITnWrU5YQrfvoH68s6EjF1Jofw9D5wxqX2HlgsCCR8005MUgWZXV',
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
