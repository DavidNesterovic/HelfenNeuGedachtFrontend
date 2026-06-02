<template>
  <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
    
    <!-- Oberer Header-Bereich -->
    <div class="mb-6 pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight md:text-3xl">Alle Einsätze</h1>
        <p class="mt-1 text-sm text-slate-500">Entdecke und plane deine kommenden Engagements</p>
      </div>
    </div>

    <!-- Haupt-Layout: Synchronisiert auf 'lg' für den Desktop-Umsprung -->
    <div class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 xl:gap-8 items-start">
      
      <!-- 1. SPALTE: FILTER-STEUERUNG (Wandert erst ab lg an den Rand und wird sticky) -->
      <div class="space-y-5 lg:sticky lg:top-6">
        
        <!-- Suche -->
        <div class="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
          <svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Einsätze suchen..."
            class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          >
        </div>

        <!-- Schnellfilter (Slider auf Mobile/Tablet, Liste auf Desktop) -->
        <!-- <div class="bg-white p-1 lg:p-4 lg:rounded-2xl lg:border lg:border-slate-100 lg:shadow-sm">
          <h3 class="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Zeitraum & Dauer</h3>
          <div class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide flex-nowrap lg:flex-wrap">
            <FilterChip
              v-for="f in quickFilters"
              :key="f.key"
              :active="filters.quickFilter === f.key"
              @click="toggleQuickFilter(f.key)"
              class="shrink-0 lg:w-full lg:justify-start"
            >
              {{ f.label }}
            </FilterChip>
          </div>
        </div> -->

        <!-- Kategorien (Slider auf Mobile/Tablet, Liste auf Desktop) -->
        <div v-if="categories.length > 0" class="bg-white p-1 lg:p-4 lg:rounded-2xl lg:border lg:border-slate-100 lg:shadow-sm">
          <div class="hidden lg:flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Interessen</h3>
            <span v-if="filters.categories.length > 0" class="text-[11px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded-md">
              {{ filters.categories.length }} aktiv
            </span>
          </div>
          <div class="flex lg:flex-wrap gap-2 overflow-x-auto lg:overflow-visible p-2 lg:pb-0 scrollbar-hide flex-nowrap lg:flex-wrap">
            <FilterChip
              v-for="c in categories"
              :key="c.id"
              :active="filters.categories.includes(c.id)"
              @click="toggleCategory(c.id)"
              class="shrink-0"
            >
              {{ c.name }}
            </FilterChip>
          </div>
        </div>
      </div>

      <!-- 2. BEREICH: EVENT-GRID (Nimmt auf Desktop die Mitte ein) -->
      <div class="lg:col-span-2 xl:col-span-3">
        
        <!-- Loading State -->
        <div v-if="pending" class="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-400 text-sm font-medium">Einsätze werden geladen...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="rounded-3xl bg-red-50/50 border border-red-100 p-8 text-center max-w-md mx-auto">
          <div class="mx-auto w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-3">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-slate-900">Fehler beim Laden</h3>
          <p class="text-xs text-red-600/80 mt-1 mb-4">Die Einsätze konnten nicht abgerufen werden.</p>
          <button @click="loadEvents" class="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition">
            Erneut versuchen
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredEvents.length === 0" class="rounded-3xl bg-white p-12 text-center border border-dashed border-slate-200 max-w-md mx-auto">
          <div class="mx-auto w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-slate-900">Keine passenden Einsätze</h3>
          <p class="text-xs text-slate-500 mt-1">Ändere deine Suchkriterien oder setze die Filter zurück, um mehr Ergebnisse zu sehen.</p>
        </div>

        <!-- Cards Grid (2 Spalten auf XL-Desktops) -->
        <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
          <EventCard
            v-for="event in filteredEvents"
            :key="event.id"
            :event="event"
            :initialInterestedShiftIds="(event.shifts ?? []).filter(s => interestedShiftIds.has(s.id)).map(s => s.id)"
            :initialAppliedShiftIds="(event.shifts ?? []).filter(s => appliedShiftIds.has(s.id)).map(s => s.id)"
            :initialConfirmedShiftIds="(event.shifts ?? []).filter(s => confirmedShiftIds.has(s.id)).map(s => s.id)"
            @show-organization="openOrgDetails"
            class="hover:shadow-md hover:border-slate-300/60 transition-all duration-200"
          />
        </div>
      </div>

      <!-- 3. SPALTE: STATS & SUMMARY (Rechte Sidebar - Sichtbar ab lg) -->
      <div class="hidden lg:block lg:col-span-1 space-y-5 lg:sticky lg:top-6">
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Deine Übersicht</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
              <span class="text-slate-500">Interessiert:</span>
              <span class="font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">{{ interestedShiftIds.size }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-slate-200/60 pb-2">
              <span class="text-slate-500">Anmeldungen:</span>
              <span class="font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-amber-600">{{ appliedShiftIds.size }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Bestätigt:</span>
              <span class="font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600">{{ confirmedShiftIds.size }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5">
          <h4 class="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5">Tipp für Helfer</h4>
          <p class="text-xs text-indigo-700/90 leading-relaxed">
            Deine vorausgewählten Interessen basieren auf deinem Profil. Du kannst die Filter jederzeit temporär anpassen, um neue Arbeitsbereiche zu entdecken.
          </p>
        </div>
      </div>

    </div>

    <!-- Popups -->
    <OrganizationPopup
      :show="showOrgPopup"
      :orgId="selectedOrgId"
      @close="closeOrgPopup"
    />
  </div>
</template>

<script setup>
import EventCard from '~/components/EventCard.vue'
import FilterChip from '~/components/FilterChip.vue'
import { getAuthHeader } from '~/assets/utils/auth'

definePageMeta({
  layout: 'user',
  middleware: 'auth',
})

const config = useRuntimeConfig()

const filters = ref({
  search: '',
  quickFilter: null,
  categories: [],
})

const quickFilters = [
  { key: 'today', label: 'Heute' },
  { key: 'weekend', label: 'Dieses Wochenende' },
  { key: 'short', label: 'Kurze Einsätze (<2h)' },
]

const categories = ref([])

const pending = ref(true)
const error = ref(false)
const events = ref([])
const interestedShiftIds = ref(new Set())
const appliedShiftIds = ref(new Set())
const confirmedShiftIds = ref(new Set())

const showOrgPopup = ref(false)
const selectedOrgId = ref(null)

const openOrgDetails = (orgId) => {
  if (!orgId) return
  selectedOrgId.value = orgId
  showOrgPopup.value = true
}

const closeOrgPopup = () => {
  showOrgPopup.value = false
  selectedOrgId.value = null
}

const toggleQuickFilter = (key) => {
  filters.value.quickFilter = filters.value.quickFilter === key ? null : key
}

const toggleCategory = (id) => {
  const idx = filters.value.categories.indexOf(id)
  if (idx === -1) filters.value.categories.push(id)
  else filters.value.categories.splice(idx, 1)
}

const filteredEvents = computed(() => {
  let result = events.value

  if (filters.value.search.trim()) {
    const q = filters.value.search.trim().toLowerCase()
    result = result.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q)
    )
  }

  if (filters.value.quickFilter === 'today') {
    const todayStr = new Date().toDateString()
    result = result.filter(e => new Date(e.startDate).toDateString() === todayStr)
  } else if (filters.value.quickFilter === 'weekend') {
    const today = new Date()
    const daysToSat = (6 - today.getDay() + 7) % 7
    const sat = new Date(today)
    sat.setDate(today.getDate() + daysToSat)
    const sun = new Date(sat)
    sun.setDate(sat.getDate() + 1)
    const satStr = sat.toDateString()
    const sunStr = sun.toDateString()
    result = result.filter(e => {
      const s = new Date(e.startDate).toDateString()
      return s === satStr || s === sunStr
    })
  } else if (filters.value.quickFilter === 'short') {
    result = result.filter(e => {
      const ms = new Date(e.endDate) - new Date(e.startDate)
      return ms > 0 && ms < 2 * 60 * 60 * 1000
    })
  }

  if (filters.value.categories.length > 0) {
    result = result.filter(e =>
      (e.shifts ?? []).some(s =>
        (s.categories ?? []).some(c => filters.value.categories.includes(c.id))
      )
    )
  }

  return result
})

const loadEvents = async () => {
  pending.value = true
  error.value = false
  try {
    const [eventsRes, participationsRes, categoriesRes, preferencesRes] = await Promise.allSettled([
      $fetch(`${config.public.apiBase}/Events`, { params: { upcoming: true }, headers: { Authorization: getAuthHeader() } }),
      $fetch(`${config.public.apiBase}/Participation/user`, {
        headers: { Authorization: getAuthHeader() },
      }),
      $fetch(`${config.public.apiBase}/categories`),
      $fetch(`${config.public.apiBase}/users/preferences`, {
        headers: { Authorization: getAuthHeader() },
      }),
    ])

    if (eventsRes.status === 'fulfilled') {
      events.value = eventsRes.value
    } else {
      error.value = true
    }

    if (participationsRes.status === 'fulfilled') {
      const parts = participationsRes.value || []
      interestedShiftIds.value = new Set(parts.filter(p => p.status === 0).map(p => p.shiftId).filter(Boolean))
      appliedShiftIds.value = new Set(parts.filter(p => p.status === 4).map(p => p.shiftId).filter(Boolean))
      confirmedShiftIds.value = new Set(parts.filter(p => p.status === 1).map(p => p.shiftId).filter(Boolean))
    }

    if (categoriesRes.status === 'fulfilled') {
      categories.value = categoriesRes.value || []
    }

    if (preferencesRes.status === 'fulfilled') {
      const saved = (preferencesRes.value || []).map(c => c.id).filter(Boolean)
      if (saved.length > 0) filters.value.categories = saved
    }
  } finally {
    pending.value = false
  }
}

onMounted(loadEvents)
</script>