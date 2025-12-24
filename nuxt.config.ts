export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~~/assets/css/main.css'],
  ui: {
    colors: {
      primary: {
        '50': '#f0f9f4',
        '100': '#e2f3e9',
        '200': '#c5e7d4',
        '300': '#a8dbbf',
        '400': '#8bcfab',
        '500': '#6dc995',
        '600': '#57a177',
        '700': '#417959',
        '800': '#2b513b',
        '900': '#15291d',
        'DEFAULT': '#6dc995'
      },
      secondary: {
        '50': '#eef7f9',
        '100': '#deeff3',
        '200': '#bde0e8',
        '300': '#9cd0dd',
        '400': '#7bc0d2',
        '500': '#3a91aa',
        '600': '#2e7488',
        '700': '#225766',
        '800': '#163a44',
        '900': '#0b1d22',
        'DEFAULT': '#3a91aa'
      },
      button: {
        '50': '#f2eff6',
        '100': '#e5e0ed',
        '200': '#cbc1da',
        '300': '#b1a2c8',
        '400': '#9783b5',
        '500': '#6b4897',
        '600': '#563a79',
        '700': '#412c5b',
        '800': '#5b446a',
        '900': '#170f1e',
        'DEFAULT': '#6b4897'
      },
      background: '#bef2eb'
    }
  }
})
