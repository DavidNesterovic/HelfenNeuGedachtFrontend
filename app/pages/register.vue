<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">H</div>
        <h1 class="text-2xl font-bold text-gray-900">Als Helfer registrieren</h1>
        <p class="mt-1.5 text-sm text-gray-500">Kostenlos mitmachen und Gutes tun</p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-5 rounded-lg bg-red-50 border-l-4 border-red-500 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="register" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="username">
            Benutzername
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            placeholder="z.B. max.mustermann"
            required
            autofocus
          >
        </div>

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
            placeholder="Mindestens 8 Zeichen"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="passwordConfirm">
            Passwort bestätigen
          </label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            placeholder="Passwort wiederholen"
            required
          >
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Registrierung läuft...' : 'Jetzt registrieren' }}
        </button>
      </form>

      <div class="mt-6 text-center border-t border-gray-200 pt-6 space-y-3">
        <NuxtLink
          to="/login"
          class="block text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Bereits registriert? <span class="text-blue-600 font-medium">Zum Login</span>
        </NuxtLink>
        <NuxtLink
          to="/organization_registration"
          class="block text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Organisation registrieren? <span class="text-blue-600 font-medium">Hier klicken</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const errorMessage = ref('')
const loading = ref(false)
let errorTimeout: ReturnType<typeof setTimeout> | null = null

const showError = (message: string) => {
  errorMessage.value = message
  if (errorTimeout) clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const register = async () => {
  errorMessage.value = ''

  const trimmedUsername = username.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedUsername || !trimmedEmail || !password.value || !passwordConfirm.value) {
    showError('Bitte füllen Sie alle Felder aus.')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    showError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
    return
  }

  if (password.value.length < 8) {
    showError('Das Passwort muss mindestens 8 Zeichen lang sein.')
    return
  }

  if (password.value !== passwordConfirm.value) {
    showError('Die Passwörter stimmen nicht überein.')
    return
  }

  loading.value = true

  try {
    const config = useRuntimeConfig()

    const response = await $fetch<{
      success: boolean
      status?: string
      message?: string
    }>(`${config.public.apiBase}/authenticate/register`, {
      method: 'POST',
      body: {
        username: trimmedUsername,
        email: trimmedEmail,
        password: password.value,
      },
    })

    if (response.success) {
      await navigateTo('/login?registered=1')
      return
    }

    showError(response.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
  } catch (error: any) {
    showError(
      error?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    )
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (errorTimeout) clearTimeout(errorTimeout)
})
</script>
