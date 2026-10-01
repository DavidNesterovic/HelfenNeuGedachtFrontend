<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">H</div>
        <h1 class="text-2xl font-bold text-slate-900">Passwort vergessen</h1>
        <p class="mt-1.5 text-sm text-slate-500">Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.</p>
      </div>

      <AppAlert type="success" :message="successMessage" class="mb-5" />
      <AppAlert type="error" :message="errorMessage" class="mb-5" />

      <form
        v-if="!submitted"
        @submit.prevent="requestReset"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5"
      >
        <AppField
          v-model="email"
          type="email"
          label="E-Mail-Adresse"
          placeholder="ihre.email@beispiel.at"
          :required="true"
          autofocus
        />

        <AppButton type="submit" class="w-full" size="lg" :loading="loading">
          {{ loading ? 'Wird gesendet...' : 'Link zum Zurücksetzen senden' }}
        </AppButton>
      </form>

      <div class="mt-6 text-center border-t border-slate-200 pt-6">
        <NuxtLink to="/login" class="text-sm text-slate-500 hover:text-slate-700 transition">
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
      body: { email: trimmedEmail },
    })
  } catch {
    // Aus Sicherheitsgründen immer gleiche Nachricht
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
