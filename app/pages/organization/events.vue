<template>
  <div class="min-h-screen bg-slate-50 flex">
    <OrganizationMenu />

    <main class="flex-1 p-8 ml-64">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Veranstaltungen</h1>
          <p class="text-slate-500 mt-1">Verwalten Sie Ihre Events und die zugehörigen Dienste</p>
        </div>
        <AppButton @click="openCreateModal" size="sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Neue Veranstaltung erstellen
        </AppButton>
      </header>

      <!-- Filter & Search -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[250px] w-full">
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Suche</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input v-model="searchQuery" type="text" placeholder="Veranstaltungsname oder Ort suchen..."
              class="pl-10 block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
          </div>
        </div>

        <div class="w-full md:w-48">
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Datum filtern</label>
          <input v-model="selectedDateFilter" type="date"
            class="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
        </div>

        <div class="w-full md:w-48">
          <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Status filtern</label>
          <select v-model="selectedStatusFilter"
            class="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-semibold">
            <option value="">Alle</option>
            <option value="0">Entwurf</option>
            <option value="1">Veröffentlicht</option>
            <option value="2">Durchgeführt</option>
            <option value="3">Abgesagt</option>
          </select>
        </div>

        <div class="flex items-center h-[42px] px-2 shrink-0">
          <label class="inline-flex items-center cursor-pointer select-none">
            <div class="relative">
              <input v-model="showPastEvents" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span class="ml-3 text-sm font-semibold text-slate-600">Vergangene anzeigen</span>
          </label>
        </div>

        <AppButton variant="muted" size="sm" @click="resetFilters" class="h-[42px] shrink-0">Zurücksetzen</AppButton>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-slate-200">
        <AppSpinner text="Lade Veranstaltungen..." padding="md" />
      </div>

      <div v-else class="space-y-8">
        <!-- Upcoming events table -->
        <EventsTable
          title="Aktive & Bevorstehende Veranstaltungen"
          dot-color="bg-blue-500"
          :events="upcomingEventsList"
          :api-base="apiBase"
          :sort-by="sortBy"
          @sort="toggleSort"
          @details="openDetails"
          @publish="publishEvent"
          @cancel="cancelEvent"
          @delete="deleteEvent"
          @complete="openCompleteModal"
        />

        <!-- Past events table -->
        <EventsTable
          v-if="showPastEvents"
          title="Vergangene Veranstaltungen"
          dot-color="bg-slate-400"
          :events="pastEventsList"
          :api-base="apiBase"
          :sort-by="sortBy"
          :past="true"
          @sort="toggleSort"
          @details="openDetails"
          @complete="openCompleteModal"
          @rate="openRatingModal"
          @delete="deleteEvent"
        />
      </div>
    </main>

    <!-- Modals -->
    <OrgEventDetailsModal
      :model-value="!!selectedEvent"
      :event="selectedEvent"
      :api-base="apiBase"
      @update:model-value="v => { if (!v) selectedEvent = null }"
      @edit="onEditFromDetails"
      @publish="publishEvent"
      @cancel="cancelEvent"
      @complete="onCompleteFromDetails"
      @rate="onRateFromDetails"
    />

    <OrgEventEditModal
      :model-value="!!editingEvent"
      :event="editingEvent"
      :api-base="apiBase"
      :available-categories="availableCategories"
      @update:model-value="v => { if (!v) editingEvent = null }"
      @closed="onEditClosed"
      @saved="onEditSaved"
    />

    <OrgEventCreateModal
      v-model="showCreateModal"
      :api-base="apiBase"
      :available-categories="availableCategories"
      @created="loadEvents"
    />

    <OrgEventCompleteModal
      v-model="showCompleteModal"
      :event="completeEvent"
      @completed="onCompleted"
    />

    <OrgEventRatingModal
      v-model="showRatingModal"
      :event="ratingEvent"
    />
  </div>
</template>

<script setup>
import { getAuthHeader, logout, authenticatedFetch, getUserInfo } from '../../assets/utils/auth'
import { useEventStatus } from '~/composables/useEventStatus'

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig()
const { alert: showDialogAlert, confirm: showDialogConfirm } = useDialog()
const { normalizeStatus, getStatusLabel, getStatusBadgeClass, needsAttention, getAttentionHint, formatDate } = useEventStatus()

const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
const events = ref([])
const isLoading = ref(true)
const availableCategories = ref([])

// Filters & sort
const searchQuery = ref('')
const selectedDateFilter = ref('')
const selectedStatusFilter = ref('')
const sortBy = ref('date-asc')
const showPastEvents = ref(false)

// Modal state
const selectedEvent = ref(null)
const editingEvent = ref(null)
const showCreateModal = ref(false)
const showCompleteModal = ref(false)
const completeEvent = ref(null)
const showRatingModal = ref(false)
const ratingEvent = ref(null)

// --- Filtering & sorting ---

const filteredAndSortedEvents = computed(() => {
  const result = events.value.filter(event => {
    const q = searchQuery.value.toLowerCase().trim()
    if (q) {
      if (!event.title?.toLowerCase().includes(q) && !event.location?.toLowerCase().includes(q)) return false
    }
    if (selectedDateFilter.value) {
      const filterDate = new Date(selectedDateFilter.value)
      const start = new Date(event.startDate)
      const end = event.endDate ? new Date(event.endDate) : start
      if (filterDate.toDateString() !== start.toDateString() && filterDate.toDateString() !== end.toDateString() && !(filterDate >= start && filterDate <= end)) return false
    }
    if (selectedStatusFilter.value !== '') {
      if (normalizeStatus(event.eventStatus) !== Number(selectedStatusFilter.value)) return false
    }
    return true
  })

  return result.sort((a, b) => {
    if (sortBy.value === 'date-asc') return new Date(a.startDate) - new Date(b.startDate)
    if (sortBy.value === 'date-desc') return new Date(b.startDate) - new Date(a.startDate)
    if (sortBy.value === 'title-asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'title-desc') return (b.title || '').localeCompare(a.title || '')
    return 0
  })
})

const upcomingEventsList = computed(() =>
  filteredAndSortedEvents.value.filter(e => {
    const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate)
    return end >= new Date()
  })
)

const pastEventsList = computed(() =>
  filteredAndSortedEvents.value.filter(e => {
    const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate)
    return end < new Date()
  })
)

const toggleSort = (column) => {
  if (column === 'title') sortBy.value = sortBy.value === 'title-asc' ? 'title-desc' : 'title-asc'
  else if (column === 'date') sortBy.value = sortBy.value === 'date-asc' ? 'date-desc' : 'date-asc'
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedDateFilter.value = ''
  selectedStatusFilter.value = ''
  sortBy.value = 'date-asc'
  evaluateShowPastDefault()
}

const evaluateShowPastDefault = () => {
  const now = new Date()
  showPastEvents.value = events.value.some(event => {
    const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
    return end < now && needsAttention(event)
  })
}

// --- Data loading ---

const loadEvents = async () => {
  if (!process.client) return
  isLoading.value = true
  try {
    const userInfo = getUserInfo()
    const data = await $fetch(`${config.public.apiBase}/events/organization/${userInfo.OrganizationId}`, {
      headers: { Authorization: getAuthHeader() },
    })
    events.value = data

    for (const event of events.value) {
      event.eventStatus = normalizeStatus(event.eventStatus)
      const shifts = await $fetch(`${config.public.apiBase}/shifts?eventId=${event.id}`, {
        headers: { Authorization: getAuthHeader() },
      })
      let required = 0, promised = 0
      for (const shift of shifts) {
        required += shift.requiredHelpers
        const helpers = await $fetch(`${config.public.apiBase}/participation/shift/${shift.id}`, {
          headers: { Authorization: getAuthHeader() },
        })
        promised += helpers.filter(h => h.status === 1).length
        shift.helperList = helpers
      }
      event.shifts = shifts
      event.requiredHelpers = required
      event.promisedHelpers = promised
    }

    evaluateShowPastDefault()
  } catch (error) {
    if (error.status === 401) logout()
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    availableCategories.value = await $fetch(`${config.public.apiBase}/categories`)
  } catch { /* ignore */ }
}

onMounted(() => {
  loadEvents()
  loadCategories()
})

// --- Modal handlers ---

const openDetails = async (event) => {
  selectedEvent.value = { ...event }
}

const openCreateModal = () => { showCreateModal.value = true }

const openCompleteModal = (event) => {
  completeEvent.value = event
  showCompleteModal.value = true
}

const openRatingModal = (event) => {
  ratingEvent.value = event
  showRatingModal.value = true
}

// Details modal emits
const onEditFromDetails = (event) => {
  selectedEvent.value = null
  editingEvent.value = { ...event }
}

const onCompleteFromDetails = (event) => {
  selectedEvent.value = null
  openCompleteModal(event)
}

const onRateFromDetails = (event) => {
  selectedEvent.value = null
  openRatingModal(event)
}

// Edit modal emits
const onEditClosed = (eventId) => {
  editingEvent.value = null
  if (eventId) {
    const ev = events.value.find(e => e.id === eventId)
    if (ev) selectedEvent.value = { ...ev }
  }
}

const onEditSaved = async (eventId) => {
  editingEvent.value = null
  await loadEvents()
  if (eventId) {
    const ev = events.value.find(e => e.id === eventId)
    if (ev) selectedEvent.value = { ...ev }
  }
}

// Complete modal emits
const onCompleted = async (event) => {
  showCompleteModal.value = false
  await loadEvents()
  const wantRating = await showDialogConfirm('Event erfolgreich abgeschlossen! Möchten Sie die Helfer jetzt bewerten?')
  if (wantRating) openRatingModal(event)
  completeEvent.value = null
}

// --- Event actions ---

const publishEvent = async (event) => {
  if (!await showDialogConfirm(`Veranstaltung „${event.title}" veröffentlichen?`)) return
  try {
    await authenticatedFetch(`${config.public.apiBase}/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...event, eventStatus: 1 }),
    })
    if (selectedEvent.value?.id === event.id) selectedEvent.value = null
    await loadEvents()
  } catch (e) {
    await showDialogAlert('Fehler beim Veröffentlichen: ' + (e.data?.message || e.message || 'Unbekannter Fehler'))
  }
}

const cancelEvent = async (event) => {
  if (!await showDialogConfirm(`Veranstaltung „${event.title}" wirklich absagen?`)) return
  try {
    await authenticatedFetch(`${config.public.apiBase}/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...event, eventStatus: 3 }),
    })
    if (selectedEvent.value?.id === event.id) selectedEvent.value = null
    await loadEvents()
  } catch (e) {
    await showDialogAlert('Fehler beim Absagen: ' + (e.data?.message || e.message || 'Unbekannter Fehler'))
  }
}

const deleteEvent = async (id) => {
  const event = events.value.find(e => e.id === id)
  if (event && event.eventStatus !== 0) {
    await showDialogAlert('Nur geplante Veranstaltungen können gelöscht werden.')
    return
  }
  if (!await showDialogConfirm('Veranstaltung wirklich löschen?')) return
  try {
    await authenticatedFetch(`${config.public.apiBase}/events/${id}`, { method: 'DELETE' })
    await loadEvents()
  } catch (e) {
    await showDialogAlert('Fehler beim Löschen.')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
