<template>
  <div class="rounded-[28px] bg-white p-5 shadow-sm">
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative h-48 sm:h-28 w-full sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
        <img
          :src="imageUrl"
          :alt="event.title"
          class="h-full w-full object-cover"
        >
      </div>

      <div class="min-w-0 flex-1">
        <h3 class="text-lg sm:text-[20px] leading-tight font-medium text-slate-900 break-words">
          {{ event.title }}
        </h3>

        <p class="mt-2 text-base sm:text-[17px] text-indigo-600 break-words">
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
          <span class="rounded-xl bg-slate-100 px-3 py-1 text-sm text-slate-500">
            Einsatz
          </span>
        </div>
      </div>
    </div>

    <!-- Shifts dropdown -->
    <div v-if="event.shifts?.length" class="mt-4 pt-3 border-t border-slate-100">
      <button
        type="button"
        class="w-full flex items-center justify-between py-0.5"
        @click="showShifts = !showShifts"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-600">
            {{ event.shifts.length }} {{ event.shifts.length === 1 ? 'Schicht' : 'Schichten' }}
          </span>
          <span v-if="interestedCount > 0" class="text-xs font-medium text-blue-600">
            · {{ interestedCount }} vorgemerkt
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
})

const config = useRuntimeConfig()
const showShifts = ref(false)

const interestedShiftIds = reactive(new Set(props.initialInterestedShiftIds))
const submittingShiftIds = reactive(new Set())

const interestedCount = computed(() => interestedShiftIds.size)

const imageUrl = computed(() =>
  `https://picsum.photos/seed/event-${props.event.id}/300/300`
)

const organizationLabel = computed(() =>
  `Organisation #${props.event.organizationId}`
)

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

  // Optimistic update
  if (wasInterested) {
    interestedShiftIds.delete(shiftId)
  } else {
    interestedShiftIds.add(shiftId)
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
      interestedShiftIds.add(shiftId)
    } else {
      interestedShiftIds.delete(shiftId)
    }
  } finally {
    submittingShiftIds.delete(shiftId)
  }
}
</script>
