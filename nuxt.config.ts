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
            titleTemplate: '%s · Tynky Bordel',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'theme-color', content: '#faf5ef' },
                { name: 'description', content: 'Tynky Bordel — ručně dělané originály: obrazy, sochy, klíčenky. Každý kousek je unikát.' },
                { name: 'robots', content: 'index,follow,max-image-preview:large' },
            ],
        },
        // Page transitions removed entirely: the fade (and the View Transitions
        // before it) fought with lazy content + scroll restoration and read as
        // janky. Instant swaps feel snappier and let scroll/image restore cleanly.
        pageTransition: false,
        layoutTransition: false,
        viewTransition: false,
    },

    experimental: {
        defaults: {
            nuxtLink: {
                prefetch: false,
            }
        },
        restoreState: true,
        viewTransition: false,
    },

    router: {
        options: {
            scrollBehaviorType: 'smooth'
        }
    },

    runtimeConfig: {
        stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '',
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        packetaApiSecret: process.env.NUXT_PACKETA_API_SECRET || process.env.PACKETA_API_SECRET || '',
        public: {
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '',
            packetaApiKey: process.env.NUXT_PUBLIC_PACKETA_API_KEY || '',
            posthogKey: process.env.NUXT_PUBLIC_POSTHOG_KEY || '',
            posthogHost: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        }
    },

    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        name: 'Tynky Bordel',
        description: 'Ručně dělané originály — obrazy, sochy, klíčenky. Každý kousek je unikát.',
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
        domains: ['picsum.photos', 'fastly.picsum.photos'],
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
        }
    },

    ignore: [
        'docker/**',
    ],

    nitro: {
        compressPublicAssets: { gzip: true, brotli: true },
        minify: true,
        /*alias: {
            debug: fileURLToPath(new URL("./server/mocks/debug.ts", import.meta.url)),
            typeorm: fileURLToPath(new URL("./server/mocks/typeorm.ts", import.meta.url)),
        },*/
        // No build-time prerendering: this is a DB-driven storefront and the
        // database is NOT available during the Docker build, so prerendering
        // `/` (and crawlLinks-reachable pages) baked a 500 error page into the
        // static output. Pages are rendered on-demand at runtime instead and
        // cached via the `swr` routeRules below, where the DB IS available.
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
