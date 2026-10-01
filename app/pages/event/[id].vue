<template>
  <div>
    <!-- Header with Back Button -->
    <div class="-mx-4 -mt-5 bg-white px-4 py-4 border-b border-slate-100 flex items-center gap-3">
      <NuxtLink to="/events" class="text-slate-600 hover:text-slate-900 flex items-center">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
      </NuxtLink>
      <h1 class="text-[17px] font-semibold text-slate-900">Einsatz-Details</h1>
    </div>

    <!-- Loading / Error states -->
    <div v-if="pending" class="mt-8 text-center text-slate-400 text-sm animate-pulse">
      Einsatz wird geladen...
    </div>

    <div v-else-if="error || !event" class="mt-8 text-center text-red-500 text-sm">
      Einsatz konnte nicht geladen werden.
    </div>

    <!-- Details Card (equivalent style to EventCard) -->
    <div v-else class="mt-5 space-y-4">
      <div class="rounded-[28px] bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4">
          <div class="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-200">
            <img
              v-if="imageUrl"
              :src="imageUrl"
              :alt="event.title"
              class="h-full w-full object-cover"
            >
            <div v-else class="h-full w-full flex items-center justify-center">
              <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="text-xl font-bold text-slate-900 break-words">
              {{ event.title }}
            </h3>

            <p @click="openOrgDetails(event.organizationId !== undefined ? event.organizationId : event.OrganizationId)" class="mt-2 text-base text-indigo-600 break-words font-medium cursor-pointer hover:underline hover:text-indigo-800 transition-colors duration-150 inline-block" title="Organisation ansehen">
              {{ organizationLabel }}
            </p>

            <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
              <span>{{ formattedDate }}</span>
              <span>{{ event.location }}</span>
              <span>{{ durationLabel }}</span>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span class="rounded-xl bg-indigo-50 px-3 py-1 text-sm text-indigo-600">
                {{ helperLabel }}
              </span>
              <span v-if="normalizedStatus === 3" class="rounded-xl bg-red-50 border border-red-200 px-3 py-1 text-sm font-semibold text-red-600">
                Abgesagt
              </span>
              <span v-else-if="normalizedStatus === 2" class="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-600">
                Durchgeführt
              </span>
              <span v-else-if="normalizedStatus === 1" class="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1 text-sm font-semibold text-blue-600">
                Veröffentlicht
              </span>
              <span v-else class="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-sm text-slate-500">
                Entwurf
              </span>
            </div>
          </div>
        </div>

        <!-- Event Description -->
        <div v-if="event.description" class="mt-5 pt-4 border-t border-slate-100 text-[14px] text-slate-600 leading-relaxed break-words">
          <p class="font-bold text-slate-800 mb-1.5 uppercase tracking-wide text-xs">Beschreibung</p>
          {{ event.description }}
        </div>

        <!-- Shifts dropdown (always open) -->
        <div v-if="event.shifts?.length" class="mt-5 pt-4 border-t border-slate-100">
          <h4 class="text-sm font-bold text-slate-800 mb-3">Verfügbare Schichten ({{ event.shifts.length }})</h4>
          
          <div class="space-y-2">
            <div
              v-for="shift in event.shifts"
              :key="shift.id"
              class="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 truncate">
                  {{ shift.name ?? `Schicht #${shift.id}` }}
                </p>
                <div class="flex items-center gap-3 mt-0.5">
                  <span v-if="shift.points" class="text-xs text-amber-600 font-medium">
                    +{{ shift.points }} Pkt.
                  </span>
                  <span v-if="shift.requiredHelpers" class="text-xs text-slate-400">
                    {{ shift.requiredHelpers }} Helfer gesucht
                  </span>
                </div>
              </div>
              <button
                type="button"
                :disabled="submittingShiftIds.has(shift.id)"
                class="shrink-0 rounded-full p-1 transition disabled:opacity-40"
                @click="toggleShiftInterest(shift.id)"
              >
                <svg
                  viewBox="0 0 24 24"
                  class="h-6 w-6 transition"
                  :class="interestedShiftIds.has(shift.id)
                    ? 'fill-blue-500 text-blue-500'
                    : 'fill-none text-slate-400'"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.74 0-3.27.81-4 2.03-.73-1.22-2.26-2.03-4-2.03-2.761 0-5 2.015-5 4.5 0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <OrganizationPopup
      :show="showOrgPopup"
      :orgId="selectedOrgId"
      @close="closeOrgPopup"
    />
  </div>
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth'

definePageMeta({
  layout: 'user',
  middleware: 'auth',
})

const route = useRoute()
const config = useRuntimeConfig()
const eventId = route.params.id

const pending = ref(true)
const error = ref(false)
const event = ref(null)

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
const interestedShiftIds = ref(new Set())
const submittingShiftIds = reactive(new Set())

const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
const imageUrl = computed(() =>
  event.value?.imageUrl ? `${apiBase.value}${event.value.imageUrl}` : null
)

const organizationName = ref('')
const organizationLabel = computed(() => {
  const name = organizationName.value || event.value?.organizationName || event.value?.OrganizationName
  const id = event.value ? (event.value.organizationId !== undefined ? event.value.organizationId : event.value.OrganizationId) : ''
  return name || (id ? `Organisation #${id}` : '')
})

const helperLabel = computed(() => {
  if (!event.value) return ''
  const required = event.value.requiredHelpers || (event.value.shifts ?? []).reduce((sum, s) => sum + (s.requiredHelpers ?? 0), 0)
  return `${required} Helfer gesucht`
})

const formattedDate = computed(() => {
  if (!event.value || !event.value.startDate) return ''
  const date = new Date(event.value.startDate)
  return new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
})

const durationLabel = computed(() => {
  if (!event.value || !event.value.startDate || !event.value.endDate) return ''
  const start = new Date(event.value.startDate).getTime()
  const end = new Date(event.value.endDate).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return ''

  const hours = Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10

  if (hours < 1) {
    const minutes = Math.round((end - start) / (1000 * 60))
    return `${minutes} Min`
  }
  if (Number.isInteger(hours)) return `${hours} Std`
  return `${String(hours).replace('.', ',')} Std`
})

const normalizeStatus = (statusVal) => {
  if (statusVal === undefined || statusVal === null) return 0;
  if (typeof statusVal === 'number') return statusVal;
  
  const parsed = parseInt(statusVal);
  if (!isNaN(parsed)) return parsed;
  
  const statusMap = {
    'Planned': 0,
    'TakePlace': 1,
    'Accomplished': 2,
    'Canceled': 3
  };
  return statusMap[statusVal] !== undefined ? statusMap[statusVal] : 0;
};

const normalizedStatus = computed(() => {
  if (!event.value) return 0
  const raw = event.value.eventStatus !== undefined ? event.value.eventStatus :
              event.value.EventStatus !== undefined ? event.value.EventStatus :
              event.value.status !== undefined ? event.value.status :
              event.value.Status;
  return normalizeStatus(raw)
})

const toggleShiftInterest = async (shiftId) => {
  if (submittingShiftIds.has(shiftId)) return

  const wasInterested = interestedShiftIds.value.has(shiftId)

  // Optimistic update
  if (wasInterested) {
    interestedShiftIds.value.delete(shiftId)
  } else {
    interestedShiftIds.value.add(shiftId)
  }
  submittingShiftIds.add(shiftId)

  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      params: {
        shiftId,
        status: 0,
      },
    })
  } catch (e) {
    console.error('Participation request failed:', e)
    // Revert on error
    if (wasInterested) {
      interestedShiftIds.value.add(shiftId)
    } else {
      interestedShiftIds.value.delete(shiftId)
    }
  } finally {
    submittingShiftIds.delete(shiftId)
  }
}

const loadEventData = async () => {
  pending.value = true
  error.value = false
  try {
    const [eventRes, participationsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/events/${eventId}`, {
        headers: { Authorization: getAuthHeader() },
      }),
      $fetch(`${config.public.apiBase}/Participation/user`, {
        headers: { Authorization: getAuthHeader() },
      }),
    ])

    event.value = eventRes
    
    const oId = event.value ? (event.value.organizationId !== undefined ? event.value.organizationId : event.value.OrganizationId) : null
    if (oId) {
      try {
        const orgRes = await $fetch(`${config.public.apiBase}/organization/${oId}`, {
          headers: { Authorization: getAuthHeader() },
        })
        if (orgRes && orgRes.name) {
          organizationName.value = orgRes.name
        }
      } catch (orgErr) {
        console.error("Error loading organization details:", orgErr)
      }
    }
    
    // Normalize status
    const rawStatus = event.value.eventStatus !== undefined ? event.value.eventStatus :
                      event.value.EventStatus !== undefined ? event.value.EventStatus :
                      event.value.status !== undefined ? event.value.status :
                      event.value.Status;
    event.value.status = normalizeStatus(rawStatus)

    // Load shifts if they are not included
    if (!event.value.shifts || event.value.shifts.length === 0) {
      try {
        const shifts = await $fetch(`${config.public.apiBase}/shifts?eventId=${eventId}`, {
          headers: { Authorization: getAuthHeader() }
        })
        event.value.shifts = shifts
      } catch (err) {
        console.error("Error loading shifts:", err)
      }
    }

    if (participationsRes) {
      interestedShiftIds.value = new Set(
        (participationsRes || [])
          .filter(p => p.status === 0 && p.shiftId)
          .map(p => p.shiftId)
      )
    }
  } catch (err) {
    console.error("Error loading event detail page data:", err)
    error.value = true
  } finally {
    pending.value = false
  }
}

onMounted(loadEventData)
</script>
