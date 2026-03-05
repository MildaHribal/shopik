// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2024-07-15',
    devtools: { enabled: true },

    modules: [
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/icon',
        '@nuxt/image',
    ],

    app: {
        head: {
            htmlAttrs: { lang: 'cs' },
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'theme-color', content: '#0d0020' },
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                // Load fonts asynchronously (avoid render-blocking @import)
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
                    media: 'print',
                    onload: "this.media='all'",
                },
            ],
        }
    },

    runtimeConfig: {
        public: {
            neonAuthUrl: process.env.VITE_NEON_AUTH_URL,
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_KEY,
        }
    },

    css: ['~~/assets/css/main.css'],

    image: {
        // Use built-in IPX (local) for responsive images
        provider: 'ipx',
        formats: ['webp', 'avif', 'png', 'jpeg'],
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
        }
    },
})