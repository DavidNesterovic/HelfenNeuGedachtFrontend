<template>
  <div>
    <div class="-mx-4 -mt-5 bg-white px-4 pt-5 pb-4 border-b border-slate-100">
      <h1 class="text-[17px] font-semibold text-slate-900">Meine Einsätze</h1>
      <p class="mt-0.5 text-[13px] text-blue-500">Deine Planung & Übersicht</p>
    </div>

    <div class="mt-6">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Anstehend</h2>

      <AppSpinner v-if="pending" text="Wird geladen..." padding="sm" />

      <div v-else-if="confirmedParticipations.length === 0" class="rounded-2xl bg-white shadow-sm border border-blue-100">
        <AppEmptyState heading="Keine anstehenden Einsätze" subtext="Du hast dich noch für keinen Einsatz angemeldet.">
          <template #icon>
            <svg viewBox="0 0 24 24" class="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
          </template>
          <template #action>
            <AppButton :as="resolveComponent('NuxtLink')" to="/events" class="mt-5">Einsätze entdecken</AppButton>
          </template>
        </AppEmptyState>
      </div>

      <div v-else class="space-y-3">
        <ShiftParticipationCard
          v-for="p in confirmedParticipations"
          :key="p.shiftId"
          :participation="p"
          :to="p.eventId ? `/event/${p.eventId}` : null"
        >
          <template #actions>
            <div class="flex items-center gap-3">
              <button @click.stop="cancelParticipation(p)" class="text-sm text-slate-400 hover:text-red-500 transition-colors">
                Absagen
              </button>
              <span v-if="p.status === 4" class="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1 text-sm font-semibold text-amber-600">Ausstehend</span>
              <span v-else class="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1 text-sm font-semibold text-blue-600">Angemeldet</span>
            </div>
          </template>
        </ShiftParticipationCard>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Vergangen</h2>

      <p v-if="!pending && completedParticipations.length === 0" class="text-sm text-slate-400">
        Noch keine vergangenen Einsätze.
      </p>

      <div v-else-if="completedParticipations.length > 0" class="space-y-3">
        <ShiftParticipationCard
          v-for="p in completedParticipations"
          :key="p.shiftId"
          :participation="p"
          :to="p.eventId ? `/event/${p.eventId}` : null"
        >
          <template #actions>
            <span class="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm font-semibold text-emerald-600">✓ Erledigt</span>
          </template>
        </ShiftParticipationCard>
      </div>
    </div>

    <div v-if="!pending && canceledParticipations.length > 0" class="mt-8">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Abgesagt</h2>
      <div class="space-y-3">
        <ShiftParticipationCard
          v-for="p in canceledParticipations"
          :key="p.shiftId"
          :participation="p"
          :to="p.eventId ? `/event/${p.eventId}` : null"
        >
          <template #actions>
            <span class="rounded-xl bg-red-50 border border-red-200 px-3 py-1 text-sm font-semibold text-red-600">Abgesagt</span>
          </template>
        </ShiftParticipationCard>
      </div>
    </div>

    <div class="mt-8 rounded-2xl bg-blue-50 px-4 py-4 flex gap-3 items-start">
      <div class="shrink-0 w-9 h-9 rounded-full border-2 border-blue-400 flex items-center justify-center">
        <span class="text-blue-500 font-bold text-sm leading-none">!</span>
      </div>
      <div>
        <p class="font-medium text-slate-900 text-[14px]">Absagen ohne Sorge</p>
        <p class="mt-1 text-[13px] text-blue-500 leading-relaxed">
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
const { refresh: refreshCounts } = useParticipationCounts()
const { show: showSnack } = useSnackbar()
const { confirm: showDialogConfirm } = useDialog()
const pending = ref(true)
const participations = ref([])

// Backend enum: Interested=0, Confirmed=1, Completed=2, Canceled=3, Applied=4
const confirmedParticipations = computed(() =>
  participations.value.filter(p => p.status === 1 || p.status === 4)
)

const completedParticipations = computed(() =>
  participations.value.filter(p => p.status === 2)
)

const canceledParticipations = computed(() =>
  participations.value.filter(p => p.status === 3)
)

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

const cancelParticipation = async (p) => {
  if (!await showDialogConfirm('Möchtest du diesen Einsatz wirklich absagen?')) return
  try {
    await $fetch(`${config.public.apiBase}/Participation`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      params: { shiftId: p.shiftId, status: 3 },
    })
    const entry = participations.value.find(x => x.shiftId === p.shiftId)
    if (entry) entry.status = 3
    showSnack('Einsatz abgesagt', { type: 'error' })
    refreshCounts()
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
