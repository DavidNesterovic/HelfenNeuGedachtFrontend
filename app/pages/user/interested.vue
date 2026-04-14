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
        :key="p.id"
        class="rounded-2xl bg-white px-4 py-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="font-medium text-slate-900 text-[15px] truncate">
              {{ p.shift?.event?.title ?? 'Einsatz' }}
            </p>
            <p class="mt-0.5 text-sm text-slate-400">
              {{ p.shift?.event?.organization?.name ?? '' }}
            </p>
            <p class="mt-0.5 text-sm text-slate-400">
              {{ formatDate(p.shift?.event?.startDate) }}
            </p>
          </div>
          <div class="shrink-0">
            <svg viewBox="0 0 24 24" class="h-6 w-6 fill-blue-500 text-blue-500" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.74 0-3.27.81-4 2.03-.73-1.22-2.26-2.03-4-2.03-2.761 0-5 2.015-5 4.5 0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
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

const interestedParticipations = computed(() =>
  participations.value.filter(p => p.status === 'Interested')
)

const interestedCount = computed(() => interestedParticipations.value.length)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(dateStr))
}

onMounted(async () => {
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
})
</script>
