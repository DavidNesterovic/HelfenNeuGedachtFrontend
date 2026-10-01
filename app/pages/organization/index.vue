<template>
  <main class="p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Organisation verwalten</h1>
      <p class="text-slate-500 text-lg mt-1">Hier können Sie die Daten Ihrer Organisation einsehen und bearbeiten</p>
    </header>

    <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <AppSpinner text="Lade Organisationsdaten..." padding="none" />
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
      <h3 class="font-bold text-lg mb-2">Fehler</h3>
      <p>{{ errorMessage }}</p>
      <button @click="loadOrganizationData" class="mt-4 text-sm font-bold underline">Erneut versuchen</button>
    </div>

    <form v-else @submit.prevent="saveChanges" class="space-y-6 max-w-5xl">

      <section class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-xl font-bold mb-6 text-slate-800 border-b border-slate-200 pb-2">Grundlegende Informationen</h3>
        <div class="grid grid-cols-1 gap-6">
          <AppField v-model="orgData.name" label="Name der Organisation" :required="true" />
          <AppField v-model="orgData.description" type="textarea" label="Beschreibung" :rows="4" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppField v-model="orgData.type" type="select" label="Typ">
              <option value="">Bitte auswählen...</option>
              <option value="Verein">Verein</option>
              <option value="Feuerwehr">Feuerwehr</option>
              <option value="NGO">NGO</option>
            </AppField>
            <AppField v-model="orgData.registrationNumber" label="Registrierungsnummer" :required="true" />
          </div>
        </div>
      </section>

      <section class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-xl font-bold mb-6 text-slate-800 border-b border-slate-200 pb-2">Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <AppField v-model="orgData.street" label="Straße und Hausnummer" />
          </div>
          <AppField v-model="orgData.postalCode" label="Postleitzahl" />
          <AppField v-model="orgData.city" label="Stadt" />
        </div>
      </section>

      <section class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="text-xl font-bold mb-6 text-slate-800 border-b border-slate-200 pb-2">Kontaktinformationen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppField v-model="orgData.contactEmail" type="email" label="Kontakt-E-Mail" :required="true" />
          <AppField v-model="orgData.contactPhone" type="tel" label="Kontakt-Telefon" />
        </div>
      </section>

      <div class="flex gap-4 sticky bottom-0 bg-slate-50 py-4 border-t border-slate-200">
        <AppButton type="submit" size="lg">Änderungen speichern</AppButton>
        <AppButton type="button" variant="secondary" size="lg" @click="loadOrganizationData">Zurücksetzen</AppButton>
      </div>
    </form>
  </main>
</template>

<script setup>
import { getUserInfo, getToken } from '~/assets/utils/auth'

definePageMeta({ middleware: 'auth' })

const orgData = ref({
  name: '',
  description: '',
  type: '',
  registrationNumber: '',
  website: '',
  street: '',
  postalCode: '',
  city: '',
  state: '',
  country: '',
  contactEmail: '',
  contactPhone: '',
  contactPersonName: '',
  contactPersonRole: ''
})

const isLoading = ref(true)
const errorMessage = ref('')
const organizationId = ref(null)
const { alert: showDialogAlert } = useDialog()

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

onMounted(async () => {
  if (process.client) {
    const userInfo = getUserInfo()
    organizationId.value =
      userInfo?.OrganizationId ??
      userInfo?.organizationId ??
      userInfo?.organization_id ??
      null

    if (!organizationId.value) {
      errorMessage.value = 'Keine Organisations-ID gefunden.'
      isLoading.value = false
      return
    }
    await loadOrganizationData()
  }
})

const loadOrganizationData = async () => {
  isLoading.value = true
  try {
    const data = await $fetch(
      `${useRuntimeConfig().public.apiBase}/organization/${organizationId.value}`,
      { headers: authHeaders() }
    )
    orgData.value = data
    errorMessage.value = ''
  } catch (error) {
    console.error('Fehler beim Laden:', error)
    errorMessage.value = 'Fehler beim Laden der Daten.'
  } finally {
    isLoading.value = false
  }
}

const saveChanges = async () => {
  try {
    await $fetch(
      `${useRuntimeConfig().public.apiBase}/organization/${organizationId.value}`,
      {
        method: 'PUT',
        body: orgData.value,
        headers: authHeaders()
      }
    )
    await showDialogAlert('Änderungen erfolgreich gespeichert!')
  } catch (error) {
    await showDialogAlert('Fehler beim Speichern der Änderungen.')
  }
}
</script>
