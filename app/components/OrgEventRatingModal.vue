<template>
  <AppModal
    :model-value="modelValue"
    title="Helfer bewerten"
    :subtitle="event?.title"
    max-width="2xl"
    header-bg="bg-amber-50"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <AppSpinner v-if="loading" text="Lade Bewertungsdaten..." padding="sm" />

      <template v-else>
        <div v-if="helpers.length === 0" class="text-center py-8 text-slate-400 italic text-sm">
          Keine bewertbaren Helfer gefunden.
        </div>

        <div v-for="rh in helpers" :key="`${rh.userId}-${rh.shiftId}`"
          class="p-4 rounded-xl border border-slate-200 space-y-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xs font-bold">
              {{ (rh.userName || '?').substring(0, 2).toUpperCase() }}
            </div>
            <div>
              <div class="font-bold text-slate-900 text-sm">{{ rh.userName }}</div>
              <div class="text-xs text-slate-500">{{ rh.shiftName }}</div>
            </div>
            <div v-if="rh.existingRating" class="ml-auto text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
              Bereits bewertet
            </div>
          </div>
          <div class="flex items-center gap-1 pl-12">
            <button v-for="star in 5" :key="star" type="button" @click="rh.rating = star"
              class="transition-transform hover:scale-110" :disabled="!!rh.existingRating">
              <svg class="w-7 h-7" :class="star <= (rh.rating || 0) ? 'text-amber-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </button>
            <span class="ml-2 text-xs text-slate-400">{{ rh.rating ? `${rh.rating}/5` : '' }}</span>
          </div>
          <input v-if="!rh.existingRating" v-model="rh.comment" type="text" placeholder="Kommentar (optional)"
            class="ml-12 mt-1 w-[calc(100%-3rem)] border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-300" />
          <p v-else-if="rh.existingComment" class="ml-12 mt-1 text-xs text-slate-500 italic">„{{ rh.existingComment }}"</p>
        </div>
      </template>
    </div>

    <template #footer-content>
      <AppButton variant="warning" class="flex-1" size="lg" :loading="saving"
        :disabled="saving || helpers.filter(r => r.rating && !r.existingRating).length === 0"
        @click="submit">
        {{ saving ? 'Wird gespeichert...' : 'Bewertungen speichern' }}
      </AppButton>
      <AppButton variant="secondary" size="lg" @click="$emit('update:modelValue', false)">Schließen</AppButton>
    </template>
  </AppModal>
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  event: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const config = useRuntimeConfig()
const { alert: showDialogAlert } = useDialog()

const helpers = ref([])
const loading = ref(false)
const saving = ref(false)

watch(() => props.modelValue, async (open) => {
  if (!open || !props.event) return
  helpers.value = []
  loading.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/events/${props.event.id}`, {
      params: { includeShifts: true },
      headers: { Authorization: getAuthHeader() },
    })
    const shifts = data.shifts || data.Shifts || []

    let existingRatings = []
    try {
      existingRatings = await $fetch(`${config.public.apiBase}/rating/event/${props.event.id}`, {
        headers: { Authorization: getAuthHeader() },
      })
    } catch { /* no ratings yet */ }

    const list = []
    for (const shift of shifts) {
      try {
        const parts = await $fetch(`${config.public.apiBase}/participation/shift/${shift.id}`, {
          headers: { Authorization: getAuthHeader() },
        })
        for (const h of parts.filter(p => p.status === 2)) {
          const existing = existingRatings.find(r => r.userId === h.userId && r.shiftId === shift.id)
          list.push({
            userId: h.userId,
            userName: h.userName,
            shiftId: shift.id,
            shiftName: shift.name,
            rating: existing?.rating || 0,
            comment: '',
            existingRating: !!existing,
            existingComment: existing?.comment || '',
          })
        }
      } catch { /* skip shift */ }
    }
    helpers.value = list
  } catch (e) {
    console.error('Fehler beim Laden der Bewertungsdaten:', e)
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  saving.value = true
  try {
    const toSubmit = helpers.value.filter(r => r.rating > 0 && !r.existingRating)
    for (const r of toSubmit) {
      await $fetch(`${config.public.apiBase}/rating`, {
        method: 'POST',
        headers: { Authorization: getAuthHeader(), 'Content-Type': 'application/json' },
        body: {
          userId: r.userId,
          eventId: props.event?.id,
          shiftId: r.shiftId,
          rating: r.rating,
          comment: r.comment || undefined,
        },
      })
      r.existingRating = true
    }
    await showDialogAlert(`${toSubmit.length} Bewertung(en) erfolgreich gespeichert!`)
  } catch (e) {
    await showDialogAlert('Fehler beim Speichern: ' + (e.data?.message || e.message || 'Unbekannter Fehler'))
  } finally {
    saving.value = false
  }
}
</script>
