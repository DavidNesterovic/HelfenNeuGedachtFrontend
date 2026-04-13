// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/styles.css'],
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:5062/api',
      hubBase: 'http://localhost:5062/hubs'
    }
  },
  build: {
    transpile: ['@microsoft/signalr']
  }
})