<template>
  <div>
    <div class="-mx-4 -mt-5 bg-white px-4 pt-5 pb-4 border-b border-slate-100">
      <h1 class="text-[17px] font-semibold text-slate-900">Alle Einsätze</h1>
    </div>

    <div class="mt-4">
      <div class="rounded-2xl bg-slate-100 px-4 py-3">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Einsätze suchen..."
          class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        >
      </div>
    </div>

    <div class="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <FilterChip
        v-for="f in quickFilters"
        :key="f.key"
        :active="filters.quickFilter === f.key"
        @click="toggleQuickFilter(f.key)"
      >
        {{ f.label }}
      </FilterChip>
    </div>

    <div class="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <FilterChip
        v-for="c in categories"
        :key="c.key"
        :active="filters.category === c.key"
        @click="toggleCategory(c.key)"
      >
        {{ c.label }}
      </FilterChip>
    </div>

    <div class="mt-5 space-y-3">
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
          :initialInterested="interestedEventIds.has(event.id)"
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

const categories = [
  { key: 'sport', label: 'Sport' },
  { key: 'culture', label: 'Kultur' },
  { key: 'social', label: 'Soziales' },
  { key: 'children', label: 'Kinder' },
  { key: 'logistics', label: 'Logistik' },
]

const pending = ref(true)
const error = ref(false)
const events = ref([])
const interestedEventIds = ref(new Set())

const toggleQuickFilter = (key) => {
  filters.value.quickFilter = filters.value.quickFilter === key ? null : key
}

const toggleCategory = (key) => {
  filters.value.category = filters.value.category === key ? null : key
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

  return result
})

const loadEvents = async () => {
  pending.value = true
  error.value = false
  try {
    const [eventsRes, participationsRes] = await Promise.allSettled([
      $fetch(`${config.public.apiBase}/Events`),
      $fetch(`${config.public.apiBase}/Participation/user`, {
        headers: { Authorization: getAuthHeader() },
      }),
    ])

    if (eventsRes.status === 'fulfilled') {
      events.value = eventsRes.value
    } else {
      error.value = true
    }

    if (participationsRes.status === 'fulfilled') {
      const ids = new Set(
        (participationsRes.value || [])
          .filter(p => p.status === 'Interested')
          .map(p => p.shift?.event?.id)
          .filter(Boolean)
      )
      interestedEventIds.value = ids
    }
  } finally {
    pending.value = false
  }
}

onMounted(loadEvents)
</script>
