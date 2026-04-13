<template>
  <div class="wizard-container">
    <div class="card-header" style="text-align: center; margin-bottom: 30px;">
      <h2>Login</h2>
    </div>

    <div class="form-section">
      <div
          v-if="errorMessage"
          class="alert-box"
          style="background-color: #fee; border-left: 4px solid #c33;"
      >
        <div class="alert-header">
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <form @submit.prevent="login">
        <div class="form-group">
          <label class="form-label" for="email">E-Mail-Adresse</label>
          <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="ihre.email@beispiel.at"
              required
              autofocus
          >
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Passwort</label>
          <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Ihr Passwort"
              required
          >
        </div>

        <div class="form-actions">
          <button
              type="submit"
              class="btn btn-primary btn-lg btn-block"
              :disabled="loading"
          >
            {{ loading ? 'Anmelden...' : 'Anmelden' }}
          </button>
        </div>
      </form>

      <div
          style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);"
      >
        <p style="color: var(--muted-foreground); margin-bottom: 10px;">
          Noch keine Organisation registriert?
        </p>

        <NuxtLink to="/organization_registration" class="btn btn-outline">
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
      localStorage.setItem('token', response.token)
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