// nuxt.config.ts
export default defineNuxtConfig({
    compatibilityDate: '2024-07-15',
    devtools: { enabled: true },

    modules: [
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/icon',
    ],

    runtimeConfig: {
        public: {
            neonAuthUrl: process.env.VITE_NEON_AUTH_URL,
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_KEY,
        }
    },

    css: ['~~/assets/css/main.css'],
})