<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="mb-6 md:mb-8 pb-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight md:text-2xl">Deine interessierten Einsätze</h1>
        <p class="mt-1 text-sm text-slate-500">{{ interestedCount }} {{ interestedCount === 1 ? 'Einsatz' : 'Einsätze' }} vorgemerkt</p>
      </div>
    </div>

    <AppSpinner v-if="pending" text="Wird geladen..." />

    <template v-else-if="interestedParticipations.length === 0">
      <AppEmptyState
        heading="Noch keine Einsätze markiert"
        subtext="Entdecke spannende Aufgaben und markiere die, die dich interessieren."
        icon-bg="bg-blue-50"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" class="h-7 w-7 text-blue-600 fill-current" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.74 0-3.27.81-4 2.03-.73-1.22-2.26-2.03-4-2.03-2.761 0-5 2.015-5 4.5 0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </template>
        <template #action>
          <AppButton :as="resolveComponent('NuxtLink')" to="/events" class="mt-6">Einsätze entdecken</AppButton>
        </template>
      </AppEmptyState>
    </template>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      <div
        v-for="p in interestedParticipations"
        :key="p.shiftId"
        class="group flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md hover:border-slate-300/80 transition-all duration-200"
      >
        <NuxtLink :to="p.eventId ? `/event/${p.eventId}` : '#'" class="flex gap-4 items-start">
          <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
            <img v-if="p.shiftImageUrl" :src="`${apiBase}${p.shiftImageUrl}`" :alt="p.shiftName" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="h-full w-full flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-semibold text-slate-900 truncate leading-snug group-hover:text-blue-600 transition-colors">
              {{ p.eventName ?? p.shiftName }}
            </h3>
            <p class="mt-0.5 text-sm font-medium text-blue-600 truncate">{{ p.shiftName }}</p>
            
            <div class="mt-3 flex flex-col gap-1 text-xs text-slate-500">
              <div v-if="p.eventStartDate" class="flex items-center gap-1.5 truncate">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="truncate">{{ formatEventDate(p.eventStartDate) }}</span>
              </div>
              <div v-if="p.eventLocation" class="flex items-center gap-1.5 truncate">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="truncate">{{ p.eventLocation }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>

        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <span v-if="p.shiftPoints" class="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/50">
            +{{ p.shiftPoints }} Punkte
          </span>
          <span v-else class="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-100">
            Einsatz
          </span>
          
          <div class="flex items-center gap-3">
            <button
              @click="removeInterest(p)"
              class="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors px-2 py-1"
            >
              Entfernen
            </button>
            <button
              @click="applyForShift(p)"
              class="rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all active:scale-[0.98]"
            >
              Anfragen
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

const { refresh: refreshCounts } = useParticipationCounts()
const { show: showSnack } = useSnackbar()

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
const pending = ref(true)
const participations = ref([])

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

const submittingShiftIds = reactive(new Set())

const applyForShift = async (p) => {
  if (submittingShiftIds.has(p.shiftId)) return
  submittingShiftIds.add(p.shiftId)
  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      params: { shiftId: p.shiftId, status: 4 },
    })
    participations.value = participations.value.filter(x => x.shiftId !== p.shiftId)
    showSnack('Anmeldung gesendet', { type: 'success' })
    refreshCounts()
  } catch (e) {
    console.error(e)
  } finally {
    submittingShiftIds.delete(p.shiftId)
  }
}

const removeInterest = async (p) => {
  if (submittingShiftIds.has(p.shiftId)) return
  submittingShiftIds.add(p.shiftId)
  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'DELETE',
      headers: { Authorization: getAuthHeader() },
      params: { shiftId: p.shiftId },
    })
    participations.value = participations.value.filter(x => x.shiftId !== p.shiftId)
    showSnack('Vormerkung entfernt')
    refreshCounts()
  } catch (e) {
    console.error(e)
  } finally {
    submittingShiftIds.delete(p.shiftId)
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