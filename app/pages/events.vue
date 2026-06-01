<template>
  <div>
    <div class="-mx-4 -mt-5 bg-white px-4 pt-5 pb-4 border-b border-slate-100">
      <h1 class="text-[17px] font-semibold text-slate-900">Alle Einsätze</h1>
    </div>

    <div class="mt-4">
      <div class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-300 focus-within:ring-2 focus-within:ring-blue-400 transition">
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
    </div>

    <div class="mt-3 flex gap-2 overflow-x-auto px-1 pt-1 pb-2 scrollbar-hide">
      <FilterChip
        v-for="f in quickFilters"
        :key="f.key"
        :active="filters.quickFilter === f.key"
        @click="toggleQuickFilter(f.key)"
      >
        {{ f.label }}
      </FilterChip>
    </div>

    <div class="flex gap-2 overflow-x-auto px-1 pt-1 pb-2 scrollbar-hide">
      <FilterChip
        v-for="c in categories"
        :key="c.id"
        :active="filters.category === c.id"
        @click="toggleCategory(c.id)"
      >
        {{ c.name }}
      </FilterChip>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-if="pending"
        class="rounded-3xl bg-white p-5 text-sm text-slate-400 shadow-sm"
      >
        Einsätze werden geladen...
      </div>

      <div
        v-else-if="error"
        class="rounded-3xl bg-white p-5 text-sm text-red-500 shadow-sm"
      >
        Einsätze konnten nicht geladen werden.
      </div>

      <div
        v-else-if="filteredEvents.length === 0"
        class="rounded-3xl bg-white p-5 text-sm text-slate-400 shadow-sm"
      >
        Keine Einsätze gefunden.
      </div>

      <template v-else>
        <EventCard
          v-for="event in filteredEvents"
          :key="event.id"
          :event="event"
          :initialInterestedShiftIds="(event.shifts ?? []).filter(s => interestedShiftIds.has(s.id)).map(s => s.id)"
          :initialAppliedShiftIds="(event.shifts ?? []).filter(s => appliedShiftIds.has(s.id)).map(s => s.id)"
          :initialConfirmedShiftIds="(event.shifts ?? []).filter(s => confirmedShiftIds.has(s.id)).map(s => s.id)"
        />
      </template>
    </div>
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
  category: null,
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

const toggleQuickFilter = (key) => {
  filters.value.quickFilter = filters.value.quickFilter === key ? null : key
}

const toggleCategory = (id) => {
  filters.value.category = filters.value.category === id ? null : id
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

  if (filters.value.category !== null) {
    result = result.filter(e =>
      (e.shifts ?? []).some(s =>
        (s.categories ?? []).some(c => c.id === filters.value.category)
      )
    )
  }

  return result
})

const loadEvents = async () => {
  pending.value = true
  error.value = false
  try {
    const [eventsRes, participationsRes, categoriesRes] = await Promise.allSettled([
      $fetch(`${config.public.apiBase}/Events`),
      $fetch(`${config.public.apiBase}/Participation/user`, {
        headers: { Authorization: getAuthHeader() },
      }),
      $fetch(`${config.public.apiBase}/categories`),
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
  } finally {
    pending.value = false
  }
}

onMounted(loadEvents)
</script>
