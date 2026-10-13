import { defineVitestConfig } from '@nuxt/test-utils/config'

// Unit-Tests laufen in der Nuxt-Umgebung, damit Auto-Imports (navigateTo,
// useState, $fetch, ...) funktionieren und per mockNuxtImport ersetzt werden können.
export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    include: ['test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['app/assets/utils/**', 'app/composables/**'],
    },
  },
})
