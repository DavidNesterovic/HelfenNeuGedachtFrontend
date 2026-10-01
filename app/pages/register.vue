<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">H</div>
        <h1 class="text-2xl font-bold text-slate-900">Als Helfer registrieren</h1>
        <p class="mt-1.5 text-sm text-slate-500">Kostenlos mitmachen und Gutes tun</p>
      </div>

      <AppAlert type="error" :message="errorMessage" class="mb-5" />

      <form @submit.prevent="register" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <AppField v-model="username" label="Benutzername" placeholder="z.B. max.mustermann" :required="true" autofocus />
        <AppField v-model="email" type="email" label="E-Mail-Adresse" placeholder="ihre.email@beispiel.at" :required="true" />
        <AppField v-model="dateOfBirth" type="date" label="Geburtsdatum" :max="maxDateOfBirth" :required="true" />
        <AppField v-model="password" type="password" label="Passwort" placeholder="Mindestens 8 Zeichen" :required="true" />
        <AppField v-model="passwordConfirm" type="password" label="Passwort bestätigen" placeholder="Passwort wiederholen" :required="true" />

        <div v-if="categories.length > 0">
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Interessen <span class="text-slate-400 font-normal">(optional)</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="cat in categories"
              :key="cat.id"
              class="inline-flex items-center gap-1.5 cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition"
              :class="selectedCategories.includes(cat.id)
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
            >
              <input type="checkbox" :value="cat.id" v-model="selectedCategories" class="sr-only">
              <span v-if="selectedCategories.includes(cat.id)" class="text-blue-500 text-xs">✓</span>
              {{ cat.name }}
            </label>
          </div>
        </div>

        <AppButton type="submit" class="w-full" size="lg" :loading="loading">
          {{ loading ? 'Registrierung läuft...' : 'Jetzt registrieren' }}
        </AppButton>
      </form>

      <div class="mt-6 text-center border-t border-slate-200 pt-6 space-y-3">
        <NuxtLink to="/login" class="block text-sm text-slate-500 hover:text-slate-700 transition">
          Bereits registriert? <span class="text-blue-600 font-medium">Zum Login</span>
        </NuxtLink>
        <NuxtLink to="/organization_registration" class="block text-sm text-slate-500 hover:text-slate-700 transition">
          Organisation registrieren? <span class="text-blue-600 font-medium">Hier klicken</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { saveToken, getHomeRoute } from '~/assets/utils/auth'

definePageMeta({ layout: false })

const config = useRuntimeConfig()

const username = ref('')
const email = ref('')
const dateOfBirth = ref('')
const password = ref('')
const passwordConfirm = ref('')
const selectedCategories = ref<number[]>([])
const categories = ref<{ id: number; name: string }[]>([])
const errorMessage = ref('')
const loading = ref(false)
let errorTimeout: ReturnType<typeof setTimeout> | null = null

const maxDateOfBirth = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const showError = (message: string) => {
  errorMessage.value = message
  if (errorTimeout) clearTimeout(errorTimeout)
  errorTimeout = setTimeout(() => { errorMessage.value = '' }, 5000)
}

const loadCategories = async () => {
  try {
    const data = await $fetch<{ id: number; name: string }[]>(`${config.public.apiBase}/categories`)
    categories.value = data || []
  } catch (e) {
    console.warn('Kategorien konnten nicht geladen werden:', e)
  }
}

onMounted(loadCategories)

const register = async () => {
  errorMessage.value = ''

  const trimmedUsername = username.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedUsername || !trimmedEmail || !dateOfBirth.value || !password.value || !passwordConfirm.value) {
    showError('Bitte füllen Sie alle Pflichtfelder aus.')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    showError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
    return
  }

  const dob = new Date(dateOfBirth.value)
  if (isNaN(dob.getTime()) || dob >= new Date()) {
    showError('Bitte geben Sie ein gültiges Geburtsdatum ein.')
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
    const body: Record<string, unknown> = {
      username: trimmedUsername,
      email: trimmedEmail,
      password: password.value,
      dateOfBirth: dateOfBirth.value,
    }

    if (selectedCategories.value.length > 0) {
      body.categoryPreferenceIds = selectedCategories.value
    }

    const response = await $fetch<{
      success: boolean
      message?: string
      token?: string
    }>(`${config.public.apiBase}/authenticate/register`, {
      method: 'POST',
      body,
    })

    if (response.success && response.token) {
      saveToken(response.token)
      await navigateTo(getHomeRoute())
      return
    }

    showError(response.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
  } catch (error: any) {
    showError(error?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (errorTimeout) clearTimeout(errorTimeout)
})
</script>
