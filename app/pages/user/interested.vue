<template>
  <div>
    <div class="-mx-4 -mt-5 bg-white px-4 pt-5 pb-4 border-b border-slate-100">
      <h1 class="text-[17px] font-semibold text-slate-900">Deine interessierten Einsätze</h1>
      <p class="mt-0.5 text-[13px] text-slate-400">{{ interestedCount }} Einsätze vorgemerkt</p>
    </div>

    <div v-if="pending" class="flex justify-center mt-20">
      <p class="text-slate-400 text-sm">Wird geladen...</p>
    </div>

    <template v-else-if="interestedParticipations.length === 0">
      <div class="flex flex-col items-center justify-center mt-16 text-center">
        <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" class="h-9 w-9 fill-blue-500 text-blue-500" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.74 0-3.27.81-4 2.03-.73-1.22-2.26-2.03-4-2.03-2.761 0-5 2.015-5 4.5 0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <h2 class="text-[17px] font-semibold text-slate-900">Noch keine Einsätze markiert</h2>
        <p class="mt-2 text-sm text-slate-400 leading-relaxed max-w-[260px]">
          Entdecke spannende Aufgaben und markiere die, die dich interessieren.
        </p>
        <NuxtLink
          to="/events"
          class="mt-7 inline-block rounded-2xl bg-blue-600 px-10 py-3 text-white font-medium text-[15px]"
        >
          Einsätze entdecken
        </NuxtLink>
      </div>
    </template>

    <div v-else class="mt-5 space-y-3">
      <div
        v-for="p in interestedParticipations"
        :key="p.shiftId"
        class="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-300"
      >
        <NuxtLink :to="p.eventId ? `/event/${p.eventId}` : '#'" class="flex gap-4">
          <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
            <img :src="`https://picsum.photos/seed/shift-${p.shiftId}/160/160`" :alt="p.shiftName" class="h-full w-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-[17px] leading-tight font-medium text-slate-900 truncate">{{ p.eventName ?? p.shiftName }}</h3>
            <p class="mt-1 text-[15px] text-indigo-600 truncate">{{ p.shiftName }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
              <span v-if="p.eventStartDate">{{ formatEventDate(p.eventStartDate) }}</span>
              <span v-if="p.eventLocation">{{ p.eventLocation }}</span>
            </div>
          </div>
        </NuxtLink>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span v-if="p.shiftPoints" class="rounded-xl bg-amber-50 px-3 py-1 text-sm text-amber-600">
            +{{ p.shiftPoints }} Punkte
          </span>
          <span v-else class="rounded-xl bg-slate-100 px-3 py-1 text-sm text-slate-500">Einsatz</span>
          <div class="flex items-center gap-2">
            <button
              @click="removeInterest(p)"
              class="text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              Entfernen
            </button>
            <button
              @click="applyForShift(p)"
              class="rounded-xl bg-blue-600 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Anmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth.js'

definePageMeta({ layout: 'user', middleware: 'auth' })

const config = useRuntimeConfig()
const pending = ref(true)
const participations = ref([])

// Interested = 0 in the backend enum
const interestedParticipations = computed(() =>
  participations.value.filter(p => p.status === 0)
)

const interestedCount = computed(() => interestedParticipations.value.length)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

const formatEventDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const fetchParticipations = async () => {
  pending.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/Participation/user`, {
      headers: { Authorization: getAuthHeader() },
    })
    participations.value = res || []
  } catch (e) {
    console.error(e)
  } finally {
    pending.value = false
  }
}

const applyForShift = async (p) => {
  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      params: { shiftId: p.shiftId, status: 4 },
    })
    participations.value = participations.value.filter(x => x.shiftId !== p.shiftId)
  } catch (e) {
    console.error(e)
  }
}

const removeInterest = async (p) => {
  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'DELETE',
      headers: { Authorization: getAuthHeader() },
      params: { shiftId: p.shiftId },
    })
    participations.value = participations.value.filter(x => x.shiftId !== p.shiftId)
  } catch (e) {
    console.error(e)
  }
}

const onVisibilityChange = () => {
  if (!document.hidden) fetchParticipations()
}

onMounted(() => {
  fetchParticipations()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>
