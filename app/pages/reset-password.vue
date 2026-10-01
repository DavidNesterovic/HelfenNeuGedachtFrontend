<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">H</div>
        <h1 class="text-2xl font-bold text-slate-900">Neues Passwort setzen</h1>
        <p class="mt-1.5 text-sm text-slate-500">Geben Sie Ihr neues Passwort ein.</p>
      </div>

      <div v-if="!tokenValid" class="mb-5 rounded-lg bg-red-50 border-l-4 border-red-500 px-4 py-3 text-sm text-red-700">
        Ungültiger oder fehlender Reset-Link. Bitte fordern Sie einen neuen Link an.
        <NuxtLink to="/forgot-password" class="block mt-2 text-blue-600 font-medium hover:text-blue-700">
          Neuen Link anfordern →
        </NuxtLink>
      </div>

      <AppAlert type="error" :message="errorMessage" class="mb-5" />

      <form
        v-if="tokenValid"
        @submit.prevent="resetPassword"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5"
      >
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">E-Mail-Adresse</label>
          <input
            :value="emailParam"
            type="email"
            class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-slate-50 text-slate-400 cursor-not-allowed"
            readonly
          >
        </div>

        <AppField
          v-model="newPassword"
          type="password"
          label="Neues Passwort"
          placeholder="Mindestens 8 Zeichen"
          :required="true"
          autofocus
        />

        <AppField
          v-model="confirmPassword"
          type="password"
          label="Passwort bestätigen"
          placeholder="Passwort wiederholen"
          :required="true"
        />

        <AppButton type="submit" class="w-full" size="lg" :loading="loading">
          {{ loading ? 'Wird gespeichert...' : 'Passwort zurücksetzen' }}
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

const route = useRoute()
const emailParam = computed(() => (route.query.email as string) || '')
const tokenParam = computed(() => (route.query.token as string) || '')
const tokenValid = computed(() => !!emailParam.value && !!tokenParam.value)

const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)
let errorTimeout: ReturnType<typeof setTimeout> | null = null

const showError = (message: string) => {
  errorMessage.value = message
  if (errorTimeout) clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const resetPassword = async () => {
  errorMessage.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    showError('Bitte füllen Sie alle Felder aus.')
    return
  }

  if (newPassword.value.length < 8) {
    showError('Das Passwort muss mindestens 8 Zeichen lang sein.')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    showError('Die Passwörter stimmen nicht überein.')
    return
  }

  loading.value = true

  try {
    const config = useRuntimeConfig()

    await $fetch(`${config.public.apiBase}/authenticate/reset-password`, {
      method: 'POST',
      body: {
        email: emailParam.value,
        token: tokenParam.value,
        newPassword: newPassword.value,
      },
    })

    await navigateTo('/login?passwordReset=1')
  } catch (error: any) {
    showError(
      error?.data?.message || 'Das Zurücksetzen des Passworts ist fehlgeschlagen. Der Link ist möglicherweise abgelaufen.'
    )
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (errorTimeout) clearTimeout(errorTimeout)
})
</script>
