<template>
  <div>
    <div class="-mx-4 -mt-5 bg-white px-4 pt-5 pb-4 border-b border-slate-100">
      <h1 class="text-[17px] font-semibold text-slate-900">Meine Einsätze</h1>
      <p class="mt-0.5 text-[13px] text-indigo-500">Deine Planung & Übersicht</p>
    </div>

    <div class="mt-6">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Anstehend</h2>

      <div v-if="pending" class="rounded-2xl bg-white p-5 shadow-sm text-sm text-slate-400">
        Wird geladen...
      </div>

      <div v-else-if="confirmedParticipations.length === 0" class="rounded-2xl bg-white p-6 shadow-sm text-center">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </div>
        </div>
        <p class="font-semibold text-slate-900 text-[15px]">Keine anstehenden Einsätze</p>
        <p class="mt-1.5 text-sm text-indigo-500">Du hast dich noch für keinen Einsatz angemeldet.</p>
        <NuxtLink
          to="/events"
          class="mt-5 inline-block rounded-2xl bg-blue-600 px-8 py-3 text-white font-medium text-[14px]"
        >
          Einsätze entdecken
        </NuxtLink>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="p in confirmedParticipations"
          :key="p.shiftId"
          class="rounded-2xl bg-white px-4 py-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-900 text-[15px]">{{ p.shiftName ?? 'Einsatz' }}</p>
              <p class="mt-0.5 text-sm text-slate-400">Angemeldet am {{ formatDate(p.updatedAt) }}</p>
            </div>
            <span class="shrink-0 text-xs rounded-full bg-blue-50 text-blue-600 px-3 py-1 font-medium">
              Angemeldet
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Vergangen</h2>

      <p v-if="!pending && completedParticipations.length === 0" class="text-sm text-slate-400">
        Noch keine vergangenen Einsätze.
      </p>

      <div v-else class="space-y-3">
        <div
          v-for="p in completedParticipations"
          :key="p.shiftId"
          class="rounded-2xl bg-white px-4 py-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-900 text-[15px]">{{ p.shiftName ?? 'Einsatz' }}</p>
              <p class="mt-0.5 text-sm text-slate-400">{{ formatDate(p.updatedAt) }}</p>
            </div>
            <div class="shrink-0 flex flex-col items-end gap-1.5">
              <span class="text-xs rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-1 font-medium whitespace-nowrap">
                ✓ Erledigt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 rounded-2xl bg-indigo-50 px-4 py-4 flex gap-3 items-start">
      <div class="shrink-0 w-9 h-9 rounded-full border-2 border-indigo-400 flex items-center justify-center">
        <span class="text-indigo-500 font-bold text-sm leading-none">!</span>
      </div>
      <div>
        <p class="font-medium text-slate-900 text-[14px]">Absagen ohne Sorge</p>
        <p class="mt-1 text-[13px] text-indigo-500 leading-relaxed">
          Das Leben ist flexibel – wir auch. Wenn etwas dazwischenkommt, sag einfach rechtzeitig ab. Kein Problem!
        </p>
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

// Backend enum: Interested=0, Confirmed=1, Completed=2, Canceled=3
const confirmedParticipations = computed(() =>
  participations.value.filter(p => p.status === 1)
)

const completedParticipations = computed(() =>
  participations.value.filter(p => p.status === 2)
)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
