<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Anmelden</h1>
      </div>

      <div
        v-if="errorMessage"
        class="mb-5 rounded-lg bg-red-50 border-l-4 border-red-500 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="login" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="email">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            placeholder="ihre.email@beispiel.at"
            required
            autofocus
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="password">
            Passwort
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            placeholder="Ihr Passwort"
            required
          >
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Anmelden...' : 'Anmelden' }}
        </button>
      </form>

      <div class="mt-6 text-center border-t border-gray-200 pt-6">
        <p class="text-sm text-gray-500 mb-3">Noch keine Organisation registriert?</p>
        <NuxtLink
          to="/organization_registration"
          class="inline-block border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-5 py-2.5 rounded-xl transition"
        >
          Jetzt Organisation registrieren →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
let errorTimeout: ReturnType<typeof setTimeout> | null = null

definePageMeta({
  layout: false
})

const showError = (message: string) => {
  errorMessage.value = message

  if (errorTimeout) {
    clearTimeout(errorTimeout)
  }

  errorTimeout = setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const login = async () => {
  errorMessage.value = ''

  const trimmedEmail = email.value.trim()

  if (!trimmedEmail || !password.value) {
    showError('Bitte füllen Sie alle Felder aus.')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    showError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
    return
  }

  loading.value = true

  try {
    const config = useRuntimeConfig()

    const response = await $fetch<{
      success: boolean
      token?: string
      message?: string
    }>(`${config.public.apiBase}/authenticate/login`, {
      method: 'POST',
      body: {
        username: trimmedEmail,
        password: password.value,
      },
    })

    if (response.success && response.token) {
      localStorage.setItem('helfenNeuGedacht_token', response.token)
      await navigateTo('/organization/dashboard')
      return
    }

    showError(response.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.')
  } catch (error: any) {
    showError(
      error?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    )
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (errorTimeout) {
    clearTimeout(errorTimeout)
  }
})
</script>
