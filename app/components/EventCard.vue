<template>
  <div class="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-300">
    <div class="flex flex-col sm:flex-row gap-4">
      <NuxtLink :to="`/event/${event.id}`" class="relative h-48 sm:h-28 w-full sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 block hover:opacity-95 transition-opacity">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="event.title"
          class="h-full w-full object-cover"
        >
        <div v-else class="h-full w-full flex items-center justify-center">
          <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </NuxtLink>

      <div class="min-w-0 flex-1">
        <h3 class="text-lg sm:text-[20px] leading-tight font-medium text-slate-900 break-words">
          <NuxtLink :to="`/event/${event.id}`" class="hover:text-blue-600 hover:underline">
            {{ event.title }}
          </NuxtLink>
        </h3>

        <p @click="emit('show-organization', event.organizationId !== undefined ? event.organizationId : event.OrganizationId)" class="mt-2 text-base sm:text-[17px] text-indigo-600 break-words font-medium cursor-pointer hover:underline hover:text-indigo-800 transition-colors duration-150 inline-block" title="Organisation ansehen">
          {{ organizationLabel }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:text-[15px] text-slate-500">
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
          <span v-else-if="normalizedStatus === 1" class="rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1 text-sm font-semibold text-indigo-600">
            Findet statt
          </span>
          <span v-else class="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-sm text-slate-500">
            Geplant
          </span>
        </div>
      </div>
    </div>

    <!-- Shifts dropdown -->
    <div v-if="visibleShifts.length" class="mt-4 pt-3 border-t border-slate-100">
      <button
        type="button"
        class="w-full flex items-center justify-between py-0.5"
        @click="showShifts = !showShifts"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-600">
            {{ visibleShifts.length }} {{ visibleShifts.length === 1 ? 'Schicht' : 'Schichten' }}
          </span>
          <span v-if="interestedCount > 0" class="text-xs font-medium text-blue-600">
            · {{ interestedCount }} vorgemerkt
          </span>
          <span v-if="appliedCount > 0" class="text-xs font-medium text-amber-600">
            · {{ appliedCount }} angemeldet
          </span>
        </div>
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4 text-slate-400 transition-transform duration-200"
          :class="showShifts ? 'rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div v-if="showShifts" class="mt-2 space-y-2">
        <div
          v-for="shift in visibleShifts"
          :key="shift.id"
          class="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
        >
          <img
            v-if="shift.imageUrl"
            :src="`${apiBase}${shift.imageUrl}`"
            :alt="shift.name"
            class="w-10 h-10 rounded-lg object-cover shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-800 truncate">
              {{ shift.name ?? `Schicht #${shift.id}` }}
            </p>
            <div class="flex items-center gap-3 mt-0.5">
              <span v-if="shift.points" class="text-xs text-amber-600 font-medium">
                +{{ shift.points }} Pkt.
              </span>
              <span
                v-if="shift.difficulty != null"
                :class="[
                  'text-xs font-medium px-1.5 py-0.5 rounded-md',
                  shift.difficulty === 2 ? 'bg-red-50 text-red-600' :
                  shift.difficulty === 1 ? 'bg-amber-50 text-amber-600' :
                  'bg-green-50 text-green-600'
                ]"
              >{{ ['Einfach','Mittel','Schwer'][shift.difficulty] ?? 'Einfach' }}</span>
              <span v-if="shift.requiredHelpers" class="text-xs text-slate-400">
                {{ shift.requiredHelpers }} Helfer gesucht
              </span>
            </div>
          </div>

          <!-- Status badge when already registered or confirmed -->
          <span v-if="confirmedShiftIds.has(shift.id)" class="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            Bestätigt
          </span>
          <span v-else-if="appliedShiftIds.has(shift.id)" class="shrink-0 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-600">
            Ausstehend
          </span>

          <!-- Register + bookmark buttons when not yet applied -->
          <div v-else class="shrink-0 flex items-center gap-1.5">
            <button
              type="button"
              :disabled="submittingShiftIds.has(shift.id)"
              class="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition disabled:opacity-40"
              @click="applyForShift(shift.id)"
            >
              Anfragen
            </button>
            <button
              type="button"
              :disabled="submittingShiftIds.has(shift.id)"
              class="rounded-full p-1 transition disabled:opacity-40"
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
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth'

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
  initialInterestedShiftIds: {
    type: Array,
    default: () => [],
  },
  initialAppliedShiftIds: {
    type: Array,
    default: () => [],
  },
  initialConfirmedShiftIds: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['show-organization'])
const config = useRuntimeConfig()
const { refresh: refreshCounts } = useParticipationCounts()
const { show: showSnack } = useSnackbar()
const showShifts = ref(false)

const interestedShiftIds = reactive(new Set(props.initialInterestedShiftIds))
const appliedShiftIds = reactive(new Set(props.initialAppliedShiftIds))
const confirmedShiftIds = reactive(new Set(props.initialConfirmedShiftIds))
const submittingShiftIds = reactive(new Set())

const interestedCount = computed(() => interestedShiftIds.size)
const appliedCount = computed(() => appliedShiftIds.size)

const visibleShifts = computed(() => props.event.shifts ?? [])

const normalizedStatus = computed(() => {
  const statusVal = props.event.eventStatus !== undefined ? props.event.eventStatus :
                    props.event.EventStatus !== undefined ? props.event.EventStatus :
                    props.event.status !== undefined ? props.event.status :
                    props.event.Status;

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
})

const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
const imageUrl = computed(() =>
  props.event.imageUrl ? `${apiBase.value}${props.event.imageUrl}` : null
)

const organizationLabel = computed(() => {
  const name = props.event.organizationName || props.event.OrganizationName
  const id = props.event.organizationId !== undefined ? props.event.organizationId : props.event.OrganizationId
  return name || `Organisation #${id}`
})

const helperLabel = computed(() =>
  `${props.event.requiredHelpers} Helfer gesucht`
)

const formattedDate = computed(() => {
  const date = new Date(props.event.startDate)
  return new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
})

const durationLabel = computed(() => {
  const start = new Date(props.event.startDate).getTime()
  const end = new Date(props.event.endDate).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return ''

  const hours = Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10

  if (hours < 1) {
    const minutes = Math.round((end - start) / (1000 * 60))
    return `${minutes} Min`
  }
  if (Number.isInteger(hours)) return `${hours} Std`
  return `${String(hours).replace('.', ',')} Std`
})

const toggleShiftInterest = async (shiftId) => {
  if (submittingShiftIds.has(shiftId)) return

  const wasInterested = interestedShiftIds.has(shiftId)

  if (wasInterested) {
    interestedShiftIds.delete(shiftId)
  } else {
    interestedShiftIds.add(shiftId)
  }
  submittingShiftIds.add(shiftId)

  try {
    if (wasInterested) {
      await $fetch(`${config.public.apiBase}/Participation`, {
        method: 'DELETE',
        headers: { Authorization: getAuthHeader() },
        params: { shiftId },
      })
    } else {
      await $fetch(`${config.public.apiBase}/Participation`, {
        method: 'POST',
        headers: { Authorization: getAuthHeader() },
        params: { shiftId, status: 0 },
      })
      showSnack('Vorgemerkt', { type: 'success' })
    }
    refreshCounts()
  } catch (e) {
    console.error('Participation request failed:', e)
    if (wasInterested) {
      interestedShiftIds.add(shiftId)
    } else {
      interestedShiftIds.delete(shiftId)
    }
  } finally {
    submittingShiftIds.delete(shiftId)
  }
}

const applyForShift = async (shiftId) => {
  if (submittingShiftIds.has(shiftId)) return

  const wasInterested = interestedShiftIds.has(shiftId)

  interestedShiftIds.delete(shiftId)
  appliedShiftIds.add(shiftId)
  submittingShiftIds.add(shiftId)

  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      params: { shiftId, status: 4 },
    })
    showSnack('Anmeldung gesendet', { type: 'success' })
    refreshCounts()
  } catch (e) {
    console.error('Apply request failed:', e)
    appliedShiftIds.delete(shiftId)
    if (wasInterested) interestedShiftIds.add(shiftId)
  } finally {
    submittingShiftIds.delete(shiftId)
  }
}
</script>
