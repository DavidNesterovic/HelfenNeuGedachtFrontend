<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">H</div>
        <h1 class="text-2xl font-bold text-slate-900">Anmelden</h1>
      </div>

      <AppAlert type="success" :message="successMessage" class="mb-5" />
      <AppAlert type="error" :message="errorMessage" class="mb-5" />

      <form @submit.prevent="login" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <AppField
          v-model="email"
          type="email"
          label="E-Mail-Adresse"
          placeholder="ihre.email@beispiel.at"
          :required="true"
          autofocus
        />

        <AppField
          v-model="password"
          type="password"
          label="Passwort"
          placeholder="Ihr Passwort"
          :required="true"
        >
          <template #label-end>
            <NuxtLink to="/forgot-password" class="text-xs text-blue-600 hover:text-blue-700 font-medium transition">
              Passwort vergessen?
            </NuxtLink>
          </template>
        </AppField>

        <AppButton type="submit" class="w-full" size="lg" :loading="loading">
          {{ loading ? 'Anmelden...' : 'Anmelden' }}
        </AppButton>
      </form>

      <div class="mt-6 border-t border-slate-200 pt-6 space-y-3">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide text-center mb-4">Noch kein Konto?</p>

        <NuxtLink
          to="/register"
          class="flex items-center justify-between w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-3 rounded-xl transition"
        >
          <span>Als Helfer registrieren</span>
          <span class="text-blue-500">→</span>
        </NuxtLink>

        <NuxtLink
          to="/organization_registration"
          class="flex items-center justify-between w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm px-4 py-3 rounded-xl transition"
        >
          <span>Organisation registrieren</span>
          <span class="text-blue-500">→</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { saveToken, getHomeRoute } from '~/assets/utils/auth'

definePageMeta({ layout: false })

const route = useRoute()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref(
  route.query.registered === '1'
    ? 'Registrierung erfolgreich! Du kannst dich jetzt anmelden.'
    : route.query.passwordReset === '1'
      ? 'Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.'
      : ''
)
const loading = ref(false)
let errorTimeout: ReturnType<typeof setTimeout> | null = null

const showError = (message: string) => {
  errorMessage.value = message
  if (errorTimeout) clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
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
      saveToken(response.token)
      await navigateTo(getHomeRoute())
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
  if (errorTimeout) clearTimeout(errorTimeout)
})
</script>
