<template>
  <div class="wizard-container">
    <div class="wizard-steps" v-if="!registrationSuccess">
      <div
          class="wizard-step"
          :class="{ active: currentStep === 1, completed: currentStep > 1 }"
      >
        <div class="wizard-step-circle">1</div>
        <div class="wizard-step-label">Kontakt-Informationen</div>
      </div>

      <div
          class="wizard-step"
          :class="{ active: currentStep === 2, completed: currentStep > 2 }"
      >
        <div class="wizard-step-circle">2</div>
        <div class="wizard-step-label">Organisation-Details</div>
      </div>

      <div
          class="wizard-step"
          :class="{ active: currentStep === 3 }"
      >
        <div class="wizard-step-circle">3</div>
        <div class="wizard-step-label">Bestätigung</div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert-box" style="background-color: #fee; border-left: 4px solid #c33; margin-bottom: 20px;">
      <div class="alert-header">
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <div v-if="currentStep === 1 && !registrationSuccess" class="form-section">
      <div class="card-header">
        <div>
          <h2>Kontakt-Informationen</h2>
          <p style="color: var(--text-muted); font-size: 14px;">Erstellen Sie Ihr Administrator-Konto</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="contactPersonName">Vor- und Nachname</label>
        <input
            id="contactPersonName"
            v-model="form.contactPersonName"
            type="text"
            class="form-input"
            placeholder="Max Musterman"
            required
        >
      </div>

      <div class="form-group">
        <label class="form-label" for="contactEmail">E-Mail-Adresse</label>
        <input
            id="contactEmail"
            v-model="form.contactEmail"
            type="email"
            class="form-input"
            placeholder="ihre.email@beispiel.at"
            required
        >
        <div class="form-hint">Diese E-Mail wird für Login und Benachrichtigungen verwendet</div>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Passwort</label>
        <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="Mindestens 8 Zeichen"
            required
        >
      </div>

      <div class="form-group">
        <label class="form-label" for="passwordConfirm">Passwort bestätigen</label>
        <input
            id="passwordConfirm"
            v-model="form.passwordConfirm"
            type="password"
            class="form-input"
            placeholder="Passwort wiederholen"
            required
        >
      </div>

      <div class="form-actions">
        <NuxtLink to="/login" class="btn btn-outline">
          Bereits registriert? Zum Login
        </NuxtLink>

        <button type="button" class="btn btn-primary" @click="nextStep(2)">
          Weiter →
        </button>
      </div>
    </div>

    <div v-if="currentStep === 2 && !registrationSuccess" class="form-section">
      <div class="card-header">
        <div>
          <h2>Organisation-Details</h2>
          <p style="color: var(--text-muted); font-size: 14px;">Informationen über Ihre Organisation</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="organizationName">Name der Organisation</label>
        <input
            id="organizationName"
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="z.B. Sportverein Musterstadt e.V."
            required
        >
      </div>

      <div class="form-group">
        <label class="form-label" for="registrationNumber">Vereinsregisternummer</label>
        <input
            id="registrationNumber"
            v-model="form.registrationNumber"
            type="text"
            class="form-input"
            placeholder="z.B. VR 12345"
        >
        <div class="form-hint">Optional, aber empfohlen für die Verifizierung</div>
      </div>

      <div class="form-group">
        <label class="form-label" for="organizationType">Art der Organisation</label>
        <select
            id="organizationType"
            v-model="form.type"
            class="form-select"
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

      <div class="form-group">
        <label class="form-label" for="street">Straße und Hausnummer</label>
        <input
            id="street"
            v-model="form.street"
            type="text"
            class="form-input"
            placeholder="z.B. Hauptstraße 123"
            required
        >
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="postalCode">Postleitzahl</label>
          <input
              id="postalCode"
              v-model="form.postalCode"
              type="text"
              class="form-input"
              placeholder="z.B. 12345"
              required
          >
        </div>

        <div class="form-group">
          <label class="form-label" for="city">Stadt</label>
          <input
              id="city"
              v-model="form.city"
              type="text"
              class="form-input"
              placeholder="z.B. Musterstadt"
              required
          >
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="contactPhone">Telefonnummer (optional)</label>
        <input
            id="contactPhone"
            v-model="form.contactPhone"
            type="tel"
            class="form-input"
            placeholder="z.B. +49 123 456789"
        >
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" @click="prevStep(1)">
          ← Zurück
        </button>

        <button type="button" class="btn btn-primary" @click="nextStep(3)">
          Weiter →
        </button>
      </div>
    </div>

    <div v-if="currentStep === 3 && !registrationSuccess" class="form-section">
      <div class="card-header">
        <div>
          <h2>Bestätigung & Datenschutz</h2>
          <p style="color: var(--text-muted); font-size: 14px;">Bestätigen Sie Ihre Angaben</p>
        </div>
      </div>

      <h3 style="margin-bottom: 16px; font-size: 16px;">Ihre E-Mail</h3>
      <div class="summary-section">
        <div class="summary-value">{{ form.contactEmail || '-' }}</div>
      </div>

      <h3 style="margin-bottom: 16px; font-size: 16px;">Organisation</h3>
      <div class="summary-section">
        <div class="summary-value">{{ form.name || '-' }}</div>
      </div>

      <h3 style="margin-bottom: 16px; font-size: 16px;">Adresse</h3>
      <div class="summary-section">
        <div class="summary-value">{{ summaryAddress }}</div>
      </div>

      <div style="margin-top: 24px;">
        <div class="checkbox-group">
          <input
              id="acceptTerms"
              v-model="acceptTerms"
              type="checkbox"
              class="checkbox-input"
              required
          >
          <label for="acceptTerms" class="checkbox-label">
            Ich akzeptiere die
            <a href="#" @click.prevent="showPlaceholderAlert('Nutzungsbedingungen')">
              Nutzungsbedingungen
            </a>
          </label>
        </div>

        <div class="checkbox-group">
          <input
              id="acceptPrivacy"
              v-model="acceptPrivacy"
              type="checkbox"
              class="checkbox-input"
              required
          >
          <label for="acceptPrivacy" class="checkbox-label">
            Ich habe die
            <a href="#" @click.prevent="showPlaceholderAlert('Datenschutzerklärung')">
              Datenschutzerklärung
            </a>
            gelesen und stimme zu
          </label>
        </div>

        <div class="checkbox-group">
          <input
              id="acceptNewsletter"
              v-model="acceptNewsletter"
              type="checkbox"
              class="checkbox-input"
          >
          <label for="acceptNewsletter" class="checkbox-label">
            Ich möchte Updates und Neuigkeiten per E-Mail erhalten (optional)
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" @click="prevStep(2)">
          Zurück
        </button>

        <button
            type="button"
            class="btn btn-primary btn-lg"
            :disabled="loading"
            @click="submitRegistration"
        >
          {{ loading ? 'Registrierung läuft...' : 'Registrierung abschließen' }}
        </button>
      </div>
    </div>

    <div v-if="registrationSuccess" class="form-section">
      <div class="text-center">
        <h2>Registrierung erfolgreich!</h2>
        <p style="color: var(--text-muted); margin: 16px 0;">
          Ihre Organisation wurde erfolgreich registriert. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
        </p>
        <button type="button" class="btn btn-primary btn-lg" @click="goToDashboard">
          Zum Dashboard →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  if (!validateStep(currentStep.value)) {
    return
  }

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
      localStorage.setItem('token', result.token)
      localStorage.setItem('userName', form.contactPersonName.trim())
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
  await navigateTo('organization/dashboard')
}
</script>