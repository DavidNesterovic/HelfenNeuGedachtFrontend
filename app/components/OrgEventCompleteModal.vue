<template>
  <AppModal
    :model-value="modelValue"
    :title="`Veranstaltung abschließen`"
    :subtitle="event?.title"
    max-width="2xl"
    header-bg="bg-purple-50"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-6">
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Anwesenheit bestätigen:</strong> Markieren Sie alle Helfer:innen, die tatsächlich anwesend waren. Anwesende erhalten ihre Punkte gutgeschrieben.
      </div>

      <div v-if="event && new Date(event.endDate) > new Date()"
        class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2.5">
        <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div><strong>Hinweis:</strong> Das Enddatum liegt in der Zukunft ({{ formatDate(event.endDate) }}).</div>
      </div>

      <AppSpinner v-if="loadingShifts" text="Lade Dienste..." padding="sm" />

      <template v-else>
        <div v-for="shift in shifts" :key="shift.id" class="space-y-2">
          <h4 class="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
            {{ shift.name }} <span class="text-slate-400 font-normal">({{ shift.points }} Pkt.)</span>
          </h4>
          <div v-if="getConfirmedHelpers(shift).length === 0" class="text-xs text-slate-400 italic pl-4">Keine bestätigten Helfer</div>
          <label v-for="helper in getConfirmedHelpers(shift)" :key="helper.userId"
            class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="checkbox" :value="helper.userId" v-model="attendedUserIds"
              class="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" />
            <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-xs font-bold">
              {{ (helper.userName || '?').substring(0, 2).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-slate-800">{{ helper.userName }}</span>
          </label>
        </div>
        <div v-if="shifts.length === 0" class="text-center py-8 text-slate-400 italic text-sm">
          Keine Dienste mit bestätigten Helfern gefunden.
        </div>
      </template>
    </div>

    <template #footer-content>
      <AppButton variant="purple" class="flex-1" size="lg" :loading="completing" :disabled="completing" @click="execute">
        {{ completing ? 'Wird abgeschlossen...' : `Event abschließen (${attendedUserIds.length} anwesend)` }}
      </AppButton>
      <AppButton variant="secondary" size="lg" @click="$emit('update:modelValue', false)">Abbrechen</AppButton>
    </template>
  </AppModal>
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth'
import { useEventStatus } from '~/composables/useEventStatus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  event: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'completed'])

const config = useRuntimeConfig()
const { confirm: showDialogConfirm, alert: showDialogAlert } = useDialog()
const { getConfirmedHelpers, formatDate } = useEventStatus()

const shifts = ref([])
const attendedUserIds = ref([])
const loadingShifts = ref(false)
const completing = ref(false)

watch(() => props.modelValue, async (open) => {
  if (!open || !props.event) return
  attendedUserIds.value = []
  shifts.value = []
  loadingShifts.value = true
  try {
    const data = await $fetch(`${config.public.apiBase}/events/${props.event.id}`, {
      params: { includeShifts: true },
      headers: { Authorization: getAuthHeader() },
    })
    const raw = data.shifts || data.Shifts || []
    for (const shift of raw) {
      try {
        shift.helperList = await $fetch(`${config.public.apiBase}/participation/shift/${shift.id}`, {
          headers: { Authorization: getAuthHeader() },
        })
      } catch { shift.helperList = [] }
    }
    shifts.value = raw
    const allConfirmed = raw.flatMap(s => getConfirmedHelpers(s).map(h => h.userId))
    attendedUserIds.value = [...new Set(allConfirmed)]
  } catch (e) {
    console.error('Fehler beim Laden der Abschluss-Daten:', e)
  } finally {
    loadingShifts.value = false
  }
})

const execute = async () => {
  if (!props.event) return
  if (!await showDialogConfirm(`Veranstaltung „${props.event.title}" wirklich abschließen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return

  completing.value = true
  try {
    await $fetch(`${config.public.apiBase}/events/${props.event.id}/complete`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader(), 'Content-Type': 'application/json' },
      body: { attendedUserIds: attendedUserIds.value },
    })
    emit('update:modelValue', false)
    emit('completed', props.event)
  } catch (e) {
    await showDialogAlert('Fehler beim Abschließen: ' + (e.data?.message || e.message || 'Unbekannter Fehler'))
  } finally {
    completing.value = false
  }
}
</script>
