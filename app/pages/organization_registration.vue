<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-lg mx-auto">

      <!-- Wizard steps -->
      <div v-if="!registrationSuccess" class="relative flex justify-between mb-10">
        <div class="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 z-0" />

        <div
          v-for="(step, i) in wizardSteps"
          :key="i"
          class="relative z-10 flex flex-col items-center gap-2 flex-1"
        >
          <div
            class="w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all"
            :class="currentStep >= i + 1
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-200 text-gray-400'"
          >
            {{ i + 1 }}
          </div>
          <span class="text-[11px] font-medium text-gray-400 text-center">{{ step }}</span>
        </div>
      </div>

      <!-- Error message -->
      <div
        v-if="errorMessage"
        class="mb-5 rounded-lg bg-red-50 border-l-4 border-red-500 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <!-- Step 1: Kontakt-Informationen -->
      <div v-if="currentStep === 1 && !registrationSuccess" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Kontakt-Informationen</h2>
          <p class="text-sm text-gray-500 mt-1">Erstellen Sie Ihr Administrator-Konto</p>
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="contactPersonName">Vor- und Nachname</label>
            <input
              id="contactPersonName"
              v-model="form.contactPersonName"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Max Musterman"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="contactEmail">E-Mail-Adresse</label>
            <input
              id="contactEmail"
              v-model="form.contactEmail"
              type="email"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="ihre.email@beispiel.at"
              required
            >
            <p class="mt-1 text-xs text-gray-400">Diese E-Mail wird für Login und Benachrichtigungen verwendet</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="password">Passwort</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Mindestens 8 Zeichen"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="passwordConfirm">Passwort bestätigen</label>
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              type="password"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Passwort wiederholen"
              required
            >
          </div>
        </div>

        <div class="flex justify-between gap-3 mt-7">
          <NuxtLink
            to="/login"
            class="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-5 py-2.5 rounded-xl transition"
          >
            Bereits registriert? Zum Login
          </NuxtLink>
          <button
            type="button"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition"
            @click="nextStep(2)"
          >
            Weiter →
          </button>
        </div>
      </div>

      <!-- Step 2: Organisation-Details -->
      <div v-if="currentStep === 2 && !registrationSuccess" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Organisation-Details</h2>
          <p class="text-sm text-gray-500 mt-1">Informationen über Ihre Organisation</p>
        </div>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="organizationName">Name der Organisation</label>
            <input
              id="organizationName"
              v-model="form.name"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="z.B. Sportverein Musterstadt e.V."
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="registrationNumber">Vereinsregisternummer</label>
            <input
              id="registrationNumber"
              v-model="form.registrationNumber"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="z.B. VR 12345"
            >
            <p class="mt-1 text-xs text-gray-400">Optional, aber empfohlen für die Verifizierung</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="organizationType">Art der Organisation</label>
            <select
              id="organizationType"
              v-model="form.type"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition"
              required
            >
              <option value="">Bitte auswählen...</option>
              <option value="Verein">Verein</option>
              <option value="Gemeinde">Gemeinde</option>
              <option value="Feuerwehr">Feuerwehr</option>
              <option value="THW">THW (Technisches Hilfswerk)</option>
              <option value="Kirche">Kirche / Religiöse Organisation</option>
              <option value="NGO">NGO / Non-Profit Organisation</option>
              <option value="Sonstige">Sonstige</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="street">Straße und Hausnummer</label>
            <input
              id="street"
              v-model="form.street"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="z.B. Hauptstraße 123"
              required
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="postalCode">Postleitzahl</label>
              <input
                id="postalCode"
                v-model="form.postalCode"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="z.B. 12345"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="city">Stadt</label>
              <input
                id="city"
                v-model="form.city"
                type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="z.B. Musterstadt"
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="contactPhone">Telefonnummer (optional)</label>
            <input
              id="contactPhone"
              v-model="form.contactPhone"
              type="tel"
              class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              placeholder="z.B. +49 123 456789"
            >
          </div>
        </div>

        <div class="flex justify-between gap-3 mt-7">
          <button
            type="button"
            class="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-5 py-2.5 rounded-xl transition"
            @click="prevStep(1)"
          >
            ← Zurück
          </button>
          <button
            type="button"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition"
            @click="nextStep(3)"
          >
            Weiter →
          </button>
        </div>
      </div>

      <!-- Step 3: Bestätigung -->
      <div v-if="currentStep === 3 && !registrationSuccess" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div class="mb-6">
          <h2 class="text-xl font-bold text-gray-900">Bestätigung & Datenschutz</h2>
          <p class="text-sm text-gray-500 mt-1">Bestätigen Sie Ihre Angaben</p>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ihre E-Mail</p>
            <p class="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5">{{ form.contactEmail || '-' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Organisation</p>
            <p class="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5">{{ form.name || '-' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Adresse</p>
            <p class="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2.5">{{ summaryAddress }}</p>
          </div>
        </div>

        <div class="space-y-3 mb-7">
          <label class="flex items-start gap-2.5 cursor-pointer">
            <input
              id="acceptTerms"
              v-model="acceptTerms"
              type="checkbox"
              class="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
              required
            >
            <span class="text-sm text-gray-600">
              Ich akzeptiere die
              <a href="#" class="text-blue-600 hover:underline" @click.prevent="showPlaceholderAlert('Nutzungsbedingungen')">Nutzungsbedingungen</a>
            </span>
          </label>

          <label class="flex items-start gap-2.5 cursor-pointer">
            <input
              id="acceptPrivacy"
              v-model="acceptPrivacy"
              type="checkbox"
              class="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
              required
            >
            <span class="text-sm text-gray-600">
              Ich habe die
              <a href="#" class="text-blue-600 hover:underline" @click.prevent="showPlaceholderAlert('Datenschutzerklärung')">Datenschutzerklärung</a>
              gelesen und stimme zu
            </span>
          </label>

          <label class="flex items-start gap-2.5 cursor-pointer">
            <input
              id="acceptNewsletter"
              v-model="acceptNewsletter"
              type="checkbox"
              class="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
            >
            <span class="text-sm text-gray-600">Ich möchte Updates und Neuigkeiten per E-Mail erhalten (optional)</span>
          </label>
        </div>

        <div class="flex justify-between gap-3">
          <button
            type="button"
            class="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-5 py-2.5 rounded-xl transition"
            @click="prevStep(2)"
          >
            Zurück
          </button>
          <button
            type="button"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition disabled:opacity-60"
            :disabled="loading"
            @click="submitRegistration"
          >
            {{ loading ? 'Registrierung läuft...' : 'Registrierung abschließen' }}
          </button>
        </div>
      </div>

      <!-- Success state -->
      <div v-if="registrationSuccess" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Registrierung erfolgreich!</h2>
        <p class="text-sm text-gray-500 mb-6">
          Ihre Organisation wurde erfolgreich registriert. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
        </p>
        <button
          type="button"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition"
          @click="goToDashboard"
        >
          Zum Dashboard →
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { saveToken, getHomeRoute } from '~/assets/utils/auth'

definePageMeta({ layout: false })

const wizardSteps = ['Kontakt-Informationen', 'Organisation-Details', 'Bestätigung']

const currentStep = ref(1)
const loading = ref(false)
const registrationSuccess = ref(false)
const errorMessage = ref('')

const acceptTerms = ref(false)
const acceptPrivacy = ref(false)
const acceptNewsletter = ref(false)

const form = reactive({
  contactPersonName: '',
  contactEmail: '',
  password: '',
  passwordConfirm: '',
  name: '',
  registrationNumber: '',
  type: '',
  street: '',
  postalCode: '',
  city: '',
  contactPhone: '',
  country: 'Österreich',
})

const summaryAddress = computed(() => {
  if (!form.street || !form.postalCode || !form.city) {
    return '-'
  }
  return `${form.street}, ${form.postalCode} ${form.city}`
})

const showError = (message: string) => {
  errorMessage.value = message
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearError = () => {
  errorMessage.value = ''
}

const showPlaceholderAlert = (label: string) => {
  alert(`${label} (noch nicht verfügbar)`)
}

const validateStep = (step: number) => {
  if (step === 1) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !form.contactPersonName.trim() ||
      !form.contactEmail.trim() ||
      !form.password ||
      !form.passwordConfirm
    ) {
      showError('Bitte füllen Sie alle Pflichtfelder aus.')
      return false
    }

    if (form.password !== form.passwordConfirm) {
      showError('Die Passwörter stimmen nicht überein.')
      return false
    }

    if (form.password.length < 8) {
      showError('Das Passwort muss mindestens 8 Zeichen lang sein.')
      return false
    }

    if (!emailRegex.test(form.contactEmail.trim())) {
      showError('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return false
    }
  }

  if (step === 2) {
    if (
      !form.name.trim() ||
      !form.type ||
      !form.street.trim() ||
      !form.postalCode.trim() ||
      !form.city.trim()
    ) {
      showError('Bitte füllen Sie alle Pflichtfelder aus.')
      return false
    }
  }

  clearError()
  return true
}

const nextStep = (step: number) => {
  if (!validateStep(currentStep.value)) return
  currentStep.value = step
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prevStep = (step: number) => {
  clearError()
  currentStep.value = step
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const submitRegistration = async () => {
  clearError()

  if (!acceptTerms.value || !acceptPrivacy.value) {
    showError('Bitte akzeptieren Sie die Nutzungsbedingungen und Datenschutzerklärung.')
    return
  }

  loading.value = true

  const config = useRuntimeConfig()

  const registrationRequest = {
    name: form.name.trim(),
    registrationNumber: form.registrationNumber.trim() || '',
    type: form.type,
    street: form.street.trim(),
    postalCode: form.postalCode.trim(),
    city: form.city.trim(),
    country: form.country,
    contactEmail: form.contactEmail.trim(),
    contactPhone: form.contactPhone.trim() || null,
    contactPersonName: form.contactPersonName.trim(),
    password: form.password,
    acceptNewsletter: acceptNewsletter.value,
  }

  try {
    const result = await $fetch<{
      success: boolean
      token?: string
      message?: string
    }>(`${config.public.apiBase}/organization`, {
      method: 'POST',
      body: registrationRequest,
    })

    if (result.success && result.token) {
      saveToken(result.token)
      registrationSuccess.value = true
      return
    }

    showError(`Registrierung fehlgeschlagen: ${result.message || 'Unbekannter Fehler'}`)
  } catch (error: any) {
    showError(
      error?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    )
  } finally {
    loading.value = false
  }
}

const goToDashboard = async () => {
  await navigateTo(getHomeRoute())
}
</script>
