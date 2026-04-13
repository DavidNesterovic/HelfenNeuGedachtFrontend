<template>
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-5 lg:px-8 pt-5 sm:pt-7">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-[22px] font-medium text-slate-900">
        Alle Einsätze
      </h1>

      <button
          type="button"
          class="self-start sm:self-auto text-sm sm:text-base lg:text-lg font-medium text-blue-600"
      >
        Swipe-Ansicht
      </button>
    </div>

    <div class="mt-5 sm:mt-7">
      <div class="rounded-2xl sm:rounded-[22px] bg-slate-200/70 px-4 sm:px-5 py-3 sm:py-4">
        <input
            v-model="filters.search"
            type="text"
            placeholder="Einsätze suchen..."
            class="w-full bg-transparent text-base sm:text-lg text-slate-700 outline-none placeholder:text-slate-500"
        >
      </div>
    </div>

    <div class="mt-5 sm:mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <FilterChip
          v-for="quickFilter in quickFilters"
          :key="quickFilter.key"
      >
        {{ quickFilter.label }}
      </FilterChip>
    </div>

    <div class="mt-4 sm:mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <FilterChip
          v-for="category in categories"
          :key="category.key"
      >
        {{ category.label }}
      </FilterChip>
    </div>

    <div class="mt-6 sm:mt-7 space-y-4 sm:space-y-5">
      <div
          v-if="pending"
          class="rounded-3xl bg-white p-5 sm:p-6 text-slate-500 shadow-sm"
      >
        Einsätze werden geladen...
      </div>

      <div
          v-else-if="error"
          class="rounded-3xl bg-white p-5 sm:p-6 text-red-600 shadow-sm"
      >
        Einsätze konnten nicht geladen werden.
      </div>

      <div
          v-else-if="events.length === 0"
          class="rounded-3xl bg-white p-5 sm:p-6 text-slate-500 shadow-sm"
      >
        Keine Einsätze gefunden.
      </div>

      <div
          v-else
          class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5"
      >
        <EventCard
            v-for="event in events"
            :key="event.id"
            :event="event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import EventCard from '~/components/EventCard.vue'
import FilterChip from '~/components/FilterChip.vue'

definePageMeta({
  layout: 'user',
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

const loadEvents = async () => {
  pending.value = true
  error.value = false

  try {
    events.value = await $fetch(`${config.public.apiBase}/Events`, {
      // later for backend filtering:
      // query: {
      //   search: filters.value.search,
      //   quickFilter: filters.value.quickFilter,
      //   category: filters.value.category,
      // }
    })
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    console.log(events.value);
    pending.value = false
  }
}

onMounted(async () => {
  await loadEvents()
})
</script>