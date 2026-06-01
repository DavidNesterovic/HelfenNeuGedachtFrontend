<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">H</div>
        <h1 class="text-2xl font-bold text-gray-900">Passwort vergessen</h1>
        <p class="mt-1.5 text-sm text-gray-500">Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.</p>
      </div>

      <div
        v-if="successMessage"
        class="mb-5 rounded-lg bg-green-50 border-l-4 border-green-500 px-4 py-3 text-sm text-green-700"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="mb-5 rounded-lg bg-red-50 border-l-4 border-red-500 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <form
        v-if="!submitted"
        @submit.prevent="requestReset"
        class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5"
      >
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

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden' }}
        </button>
      </form>

      <div class="mt-6 text-center border-t border-gray-200 pt-6">
        <NuxtLink
          to="/login"
          class="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          ← <span class="text-blue-600 font-medium">Zurück zum Login</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const email = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)
const submitted = ref(false)
let errorTimeout: ReturnType<typeof setTimeout> | null = null

const showError = (message: string) => {
  errorMessage.value = message
  if (errorTimeout) clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const requestReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  const trimmedEmail = email.value.trim()

  if (!trimmedEmail) {
    showError('Bitte geben Sie Ihre E-Mail-Adresse ein.')
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

    await $fetch(`${config.public.apiBase}/authenticate/forgot-password`, {
      method: 'POST',
      body: {
        email: trimmedEmail,
      },
    })
  } catch {
    // Aus Sicherheitsgründen zeigen wir immer die gleiche Nachricht
  } finally {
    loading.value = false
    submitted.value = true
    successMessage.value = 'Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts gesendet.'
  }
}

onBeforeUnmount(() => {
  if (errorTimeout) clearTimeout(errorTimeout)
})
</script>
