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
        }
    },

    experimental: {
        defaults: {
            nuxtLink: {
                prefetch: false,
            }
        }
    },

    runtimeConfig: {
        public: {
            neonAuthUrl: process.env.VITE_NEON_AUTH_URL,
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_KEY,
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        }
    },

    css: ['~~/assets/css/main.css'],

    image: {
        provider: 'ipx',
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
        compressPublicAssets: true,
    },

    routeRules: {
        '/_nuxt/**': {
            headers: {
                'cache-control': 'public, max-age=31536000, immutable',
            }
        },
        '/assets/**': {
            headers: {
                'cache-control': 'public, max-age=31536000, immutable',
            }
        },
        '/': {
            swr: 300,
        },
        '/product/**': {
            swr: 300,
        },
        '/auth/**': {
            proxy: process.env.VITE_NEON_AUTH_URL + '/**'
        }
    },
})
