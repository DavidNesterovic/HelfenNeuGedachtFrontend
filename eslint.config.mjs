// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

// Quality Gate: "error" stoppt die Pipeline, "warn" wird nur gemeldet.
export default withNuxt({
  rules: {
    // Sicherheitsrisiken (XSS / Code-Injection) -> blockierend
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'vue/no-v-html': 'error',
    'no-debugger': 'error',

    // Code-Hygiene / Deprecations -> nur Warnung
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-empty': 'warn',
    'no-unused-vars': ['warn', { caughtErrors: 'none' }],
    '@typescript-eslint/no-unused-vars': ['warn', { caughtErrors: 'none' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'nuxt/prefer-import-meta': 'warn',
    'vue/multi-word-component-names': 'off',
  },
})
