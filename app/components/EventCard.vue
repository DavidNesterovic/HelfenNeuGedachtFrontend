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
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-lg sm:text-[20px] leading-tight font-medium text-slate-900 break-words">
            {{ event.title }}
          </h3>

          <button
              type="button"
              class="shrink-0 rounded-full p-1 transition"
              :disabled="isSubmitting"
              @click="toggleParticipation"
          >
            <svg
                viewBox="0 0 24 24"
                class="h-7 w-7 transition"
                :class="isInterested ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-slate-400'"
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
  </div>
</template>

<script setup>
const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
})

const config = useRuntimeConfig()

const isInterested = ref(false)
const isSubmitting = ref(false)

const imageUrl = computed(() => {
  return `https://picsum.photos/seed/event-${props.event.id}/300/300`
})

const organizationLabel = computed(() => {
  return `Organisation #${props.event.organizationId}`
})

const helperLabel = computed(() => {
  return `${props.event.requiredHelpers} Helfer gesucht`
})

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

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return ''
  }

  const hours = Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10

  if (hours < 1) {
    const minutes = Math.round((end - start) / (1000 * 60))
    return `${minutes} Min`
  }

  if (Number.isInteger(hours)) {
    return `${hours} Std`
  }

  return `${String(hours).replace('.', ',')} Std`
})

const toggleParticipation = async () => {
  if (isSubmitting.value) {
    return
  }

  const previousValue = isInterested.value
  isInterested.value = !isInterested.value
  isSubmitting.value = true

  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'POST',
      body: {
        eventId: props.event.id,
      },
    })
  } catch (e) {
    console.error('Participation request failed:', e)
    isInterested.value = previousValue
  } finally {
    isSubmitting.value = false
  }
}
</script>