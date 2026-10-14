<template>
  <main class="max-w-6xl mx-auto px-4 sm:px-8 py-8">
    <header class="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Newsletter-Anmeldungen</h1>
        <p class="text-slate-500 mt-1">Anmeldungen über die Landing Page</p>
      </div>
      <div class="flex gap-2">
        <AppButton variant="secondary" :disabled="!filtered.length" @click="copyEmails">E-Mails kopieren</AppButton>
        <AppButton :disabled="!filtered.length" @click="exportCsv">CSV herunterladen</AppButton>
      </div>
    </header>

    <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
      <AppSpinner text="Lade Anmeldungen..." padding="none" />
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
      <p>{{ errorMessage }}</p>
      <button type="button" class="mt-4 text-sm font-bold underline" @click="load">Erneut versuchen</button>
    </div>

    <div v-else class="space-y-6">
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-slate-200 p-5">
          <p class="text-sm text-slate-500">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-slate-900 mt-1 tabular-nums">{{ stat.value }}</p>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center gap-3">
          <div class="flex gap-2 overflow-x-auto">
            <FilterChip
              v-for="option in filterOptions"
              :key="option.label"
              :active="interestFilter === option.value"
              @click="interestFilter = option.value"
            >
              {{ option.label }}
            </FilterChip>
          </div>
          <label class="md:ml-auto w-full md:w-72">
            <span class="sr-only">E-Mail suchen</span>
            <input
              v-model="search"
              type="search"
              placeholder="E-Mail suchen"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
          </label>
        </div>

        <AppEmptyState
          v-if="!filtered.length"
          :heading="subscriptions.length ? 'Keine Treffer' : 'Noch keine Anmeldungen'"
          :subtext="subscriptions.length ? 'Kein Eintrag passt zu Filter und Suche.' : 'Sobald sich jemand auf der Landing Page einträgt, erscheint die Adresse hier.'"
        />

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-500 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 font-medium">E-Mail</th>
                <th class="px-4 py-3 font-medium">Interesse als</th>
                <th class="px-4 py-3 font-medium whitespace-nowrap">Angemeldet am</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-900 break-all">{{ item.email }}</td>
                <td class="px-4 py-3">
                  <AppBadge :variant="item.interestType === INTEREST.Organization ? 'indigo' : 'success'">
                    {{ interestLabel(item.interestType) }}
                  </AppBadge>
                </td>
                <td class="px-4 py-3 text-slate-500 whitespace-nowrap tabular-nums">{{ formatDate(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { getAuthHeader, logout } from '~/assets/utils/auth'
import { toCsv, downloadCsv } from '~/assets/utils/csv'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Newsletter-Anmeldungen', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

// Entspricht NewsletterInterestType der API
const INTEREST = { Organization: 0, Helper: 1 }

const filterOptions = [
  { label: 'Alle', value: null },
  { label: 'Organisationen', value: INTEREST.Organization },
  { label: 'Helfer', value: INTEREST.Helper },
]

const subscriptions = ref([])
const isLoading = ref(true)
const errorMessage = ref('')
const interestFilter = ref(null)
const search = ref('')
const { show: showSnackbar } = useSnackbar()

const interestLabel = type => (type === INTEREST.Organization ? 'Organisation / Verein' : 'Helfer')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return subscriptions.value.filter(item =>
    (interestFilter.value === null || item.interestType === interestFilter.value)
    && (!term || item.email.includes(term)))
})

const stats = computed(() => [
  { label: 'Gesamt', value: subscriptions.value.length },
  { label: 'Organisationen', value: subscriptions.value.filter(i => i.interestType === INTEREST.Organization).length },
  { label: 'Helfer', value: subscriptions.value.filter(i => i.interestType === INTEREST.Helper).length },
])

// Die API speichert UTC, liefert den Wert aber ohne Zeitzone
const toDate = value => new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`)

const dateFormat = new Intl.DateTimeFormat('de-AT', { dateStyle: 'medium', timeStyle: 'short' })
const formatDate = value => dateFormat.format(toDate(value))

const load = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    subscriptions.value = await $fetch(`${useRuntimeConfig().public.apiBase}/newsletter`, {
      headers: { Authorization: getAuthHeader() },
    })
  } catch (error) {
    if (error?.status === 401) return logout()
    errorMessage.value = error?.status === 403
      ? 'Dieser Bereich ist nur für SuperAdmins.'
      : 'Die Anmeldungen konnten nicht geladen werden.'
  } finally {
    isLoading.value = false
  }
}

const copyEmails = async () => {
  try {
    await navigator.clipboard.writeText(filtered.value.map(i => i.email).join('; '))
    showSnackbar(`${filtered.value.length} Adressen kopiert`, { type: 'success' })
  } catch {
    showSnackbar('Kopieren nicht möglich. Bitte die CSV verwenden.', { type: 'error' })
  }
}

const exportCsv = () => {
  const csv = toCsv(filtered.value, [
    { label: 'E-Mail', value: i => i.email },
    { label: 'Interesse als', value: i => interestLabel(i.interestType) },
    { label: 'Angemeldet am', value: i => formatDate(i.createdAt) },
  ])
  const today = new Date().toISOString().slice(0, 10)
  downloadCsv(`newsletter-anmeldungen-${today}.csv`, csv)
}

onMounted(load)
</script>
