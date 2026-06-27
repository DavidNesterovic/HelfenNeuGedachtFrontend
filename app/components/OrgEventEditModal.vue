<template>
  <div v-if="modelValue && event"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">

      <div class="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <h2 class="text-xl font-bold text-slate-900">Veranstaltung bearbeiten</h2>
        <button @click="close" class="text-slate-400 hover:text-slate-600">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
        <!-- Left: Event form -->
        <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-200">
          <form @submit.prevent="save" class="space-y-4">
            <AppField v-model="editForm.title" label="Titel" placeholder="Sommerfest" :required="true" />
            <AppField v-model="editForm.description" type="textarea" label="Beschreibung" :rows="4" :required="true" />

            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-500 mb-1 uppercase">Bild</label>
              <ImageUploadCrop :current-url="editImageCurrentUrl" :aspect-ratio="1" @change="f => editImageFile = f" />
            </div>

            <AppField v-model="editForm.location" label="Ort" placeholder="Marktplatz" :required="true" />

            <div class="grid grid-cols-2 gap-2">
              <AppField v-model="editForm.startDate" type="datetime-local" label="Start" :min="editMinStartDate" :required="true" />
              <AppField v-model="editForm.endDate" type="datetime-local" label="Ende" :min="editMinEndDate" :required="true" />
            </div>

            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-500 mb-1 uppercase">Event-Status</label>
              <div class="flex items-center gap-3 mt-1">
                <span :class="getStatusBadgeClass(editForm.eventStatus)" class="px-3 py-1.5 rounded-full text-sm font-bold border">
                  {{ getStatusLabel(editForm.eventStatus) }}
                </span>
              </div>
              <div class="flex flex-wrap gap-2 mt-3">
                <button v-if="Number(editForm.eventStatus) === 0" type="button" @click="editForm.eventStatus = 1"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Veröffentlichen
                </button>
                <button v-if="Number(editForm.eventStatus) === 0 || Number(editForm.eventStatus) === 1" type="button" @click="editForm.eventStatus = 3"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  Absagen
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 italic">Status-Änderungen sind nur vorwärts möglich.</p>
            </div>

            <div class="flex gap-4 pt-4">
              <AppButton type="submit" class="flex-1" size="lg" :loading="saving" :disabled="saving">
                {{ saving ? 'Wird gespeichert...' : 'Änderungen speichern' }}
              </AppButton>
              <AppButton type="button" variant="secondary" class="flex-1" size="lg" @click="close">Abbrechen</AppButton>
            </div>
          </form>
        </div>

        <!-- Right: Shift management -->
        <div class="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-slate-800">Dienste verwalten</h3>
            <button v-if="!showShiftForm" @click="startAddShift"
              class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-blue-700 transition">
              DIENST HINZUFÜGEN
            </button>
          </div>

          <!-- Shift form -->
          <div v-if="showShiftForm" class="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
            <input v-model="shiftForm.name" placeholder="Name (z.B. Bar-Dienst) *"
              class="w-full border border-slate-200 p-2 rounded shadow-sm outline-none" />
            <textarea v-model="shiftForm.description" placeholder="Beschreibung"
              class="w-full border border-slate-200 p-2 rounded shadow-sm outline-none"></textarea>
            <div class="grid grid-cols-2 gap-2">
              <label class="self-center text-sm text-slate-600">Anzahl Helfer <span class="text-red-500">*</span></label>
              <input v-model.number="shiftForm.requiredHelpers" type="number" min="0" class="border border-slate-200 p-2 rounded shadow-sm outline-none" />
              <label class="self-center text-sm text-slate-600">Schwierigkeit</label>
              <select v-model.number="shiftForm.difficulty" class="border border-slate-200 p-2 rounded shadow-sm outline-none bg-white">
                <option :value="0">Einfach (10 Pkt/h)</option>
                <option :value="1">Mittel (20 Pkt/h)</option>
                <option :value="2">Schwer (30 Pkt/h)</option>
              </select>
              <label class="self-center text-sm text-slate-600">Mindestalter</label>
              <input v-model.number="shiftForm.ageRestriction" type="number" min="0" class="border border-slate-200 p-2 rounded shadow-sm outline-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <label class="text-xs text-slate-500">Schichtstart</label>
                <input v-model="shiftForm.startTime" type="datetime-local" class="border border-slate-200 p-2 rounded shadow-sm outline-none text-sm" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs text-slate-500">Schichtende</label>
                <input v-model="shiftForm.endTime" type="datetime-local" class="border border-slate-200 p-2 rounded shadow-sm outline-none text-sm" />
              </div>
            </div>
            <div class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {{ shiftPointsPreview }} Punkte ({{ shiftDifficultyLabel(shiftForm.difficulty) }} · {{ shiftDurationLabel }})
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Kategorien</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="cat in availableCategories" :key="cat.id" type="button" @click="toggleShiftCategory(cat.id)"
                  :class="['px-3 py-1 rounded-full text-xs font-semibold border transition-colors', shiftForm.categoryIds.includes(cat.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400']">
                  {{ cat.name }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Bild <span class="font-normal normal-case text-slate-400">(optional)</span></label>
              <ImageUploadCrop :current-url="shiftImageCurrentUrl" :aspect-ratio="1" height="8rem" @change="f => shiftImageFile = f" @clear="shiftImageFile = null" />
            </div>
            <div class="flex gap-2">
              <AppButton @click="saveShift" class="flex-1">{{ shiftForm.id ? 'Aktualisieren' : 'Dienst speichern' }}</AppButton>
              <AppButton variant="secondary" @click="resetShiftForm" class="flex-1">Abbrechen</AppButton>
            </div>
          </div>

          <!-- Shifts list -->
          <div class="space-y-3 flex-1 overflow-y-auto">
            <div v-for="shift in currentShifts" :key="shift.id"
              class="flex justify-between items-start p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-900">{{ shift.name }}</h4>
                <p class="text-xs text-slate-500">{{ shift.points }} Punkte | {{ getConfirmedHelpers(shift).length }}/{{ shift.requiredHelpers }} Helfer</p>
                <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                  <span v-for="cat in shift.categories" :key="cat.id"
                    class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">{{ cat.name }}</span>
                </div>

                <!-- Helpers -->
                <div class="mt-3 bg-slate-50 rounded-lg overflow-hidden">
                  <h5 class="text-xs font-black uppercase text-slate-400 px-3 pt-3 pb-2">Helfer:innen</h5>

                  <template v-if="getInterestedHelpers(shift).length > 0">
                    <div class="px-3 pb-1.5"><span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vorgemerkt ({{ getInterestedHelpers(shift).length }})</span></div>
                    <div v-for="h in getInterestedHelpers(shift)" :key="'i-'+h.userId" class="flex items-center px-3 py-1.5 border-t border-slate-100 gap-2 text-sm text-slate-500">
                      <img v-if="h.avatarUrl" :src="`${apiBase}${h.avatarUrl}`" class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                      <div v-else class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-slate-400" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                      </div>
                      <span @click="activeUserId = h.userId" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors">{{ h.userName }}</span>
                    </div>
                  </template>

                  <template v-if="getAppliedHelpers(shift).length > 0">
                    <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 }">
                      <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Angemeldet ({{ getAppliedHelpers(shift).length }})</span>
                    </div>
                    <div v-for="h in getAppliedHelpers(shift)" :key="'a-'+h.userId" class="flex items-center justify-between px-3 py-1.5 border-t border-slate-100">
                      <div class="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                        <img v-if="h.avatarUrl" :src="`${apiBase}${h.avatarUrl}`" class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-amber-200" />
                        <div v-else class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-amber-400" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                        </div>
                        <span @click="activeUserId = h.userId" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors">{{ h.userName }}</span>
                      </div>
                      <div class="flex gap-1 shrink-0 ml-2">
                        <button @click="confirmHelper(h)" :disabled="h._updating"
                          class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50">Bestätigen</button>
                        <button @click="rejectHelper(h)" :disabled="h._updating"
                          class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">Ablehnen</button>
                      </div>
                    </div>
                  </template>

                  <template v-if="getConfirmedHelpers(shift).length > 0">
                    <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 || getAppliedHelpers(shift).length > 0 }">
                      <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Bestätigt ({{ getConfirmedHelpers(shift).length }})</span>
                    </div>
                    <div v-for="h in getConfirmedHelpers(shift)" :key="'c-'+h.userId" class="flex items-center px-3 py-1.5 border-t border-slate-100 gap-2 text-sm text-slate-700">
                      <img v-if="h.avatarUrl" :src="`${apiBase}${h.avatarUrl}`" class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-emerald-200" />
                      <div v-else class="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-emerald-500" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                      </div>
                      <span @click="activeUserId = h.userId" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors">{{ h.userName }}</span>
                    </div>
                  </template>

                  <div v-if="!getInterestedHelpers(shift).length && !getAppliedHelpers(shift).length && !getConfirmedHelpers(shift).length"
                    class="px-3 pb-3 text-xs text-slate-400 italic">Noch keine Helfer:innen</div>
                  <div class="pb-1"></div>
                </div>
              </div>

              <div class="flex gap-2 font-bold uppercase text-xs mt-2 ml-3 shrink-0">
                <button @click="editShift(shift)" class="text-blue-600 hover:text-blue-800">Bearbeiten</button>
                <button @click="removeShift(shift.id)" class="text-red-500 hover:text-red-700">Löschen</button>
              </div>
            </div>
            <div v-if="currentShifts.length === 0" class="text-center py-8 text-slate-400 italic text-sm">
              Noch keine Dienste für dieses Event erstellt.
            </div>
          </div>
        </div>
      </div>
    </div>

    <OrgUserPopup :user-id="activeUserId" @close="activeUserId = null" />
  </div>
</template>

<script setup>
import { getAuthHeader, authenticatedFetch } from '~/assets/utils/auth'
import { useEventStatus } from '~/composables/useEventStatus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  event: { type: Object, default: null },
  apiBase: { type: String, default: '' },
  availableCategories: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'closed', 'saved'])

const config = useRuntimeConfig()
const { alert: showDialogAlert, confirm: showDialogConfirm } = useDialog()
const { getStatusLabel, getStatusBadgeClass, getInterestedHelpers, getAppliedHelpers, getConfirmedHelpers } = useEventStatus()

// State
const editForm = ref({ title: '', description: '', location: '', startDate: '', endDate: '', eventStatus: 0 })
const editImageFile = ref(null)
const currentShifts = ref([])
const showShiftForm = ref(false)
const shiftForm = ref({ id: null, name: '', description: '', requiredHelpers: 1, ageRestriction: 0, difficulty: 0, startTime: '', endTime: '', categoryIds: [] })
const shiftImageFile = ref(null)
const saving = ref(false)
const shiftsToDelete = ref([])
const activeUserId = ref(null)

// Computed
const editImageCurrentUrl = computed(() =>
  props.event?.imageUrl ? `${props.apiBase}${props.event.imageUrl}` : null
)

const shiftImageCurrentUrl = computed(() => {
  if (shiftImageFile.value) {
    try { return URL.createObjectURL(shiftImageFile.value) } catch { return null }
  }
  if (!shiftForm.value?.imageUrl) return null
  return `${props.apiBase}${shiftForm.value.imageUrl}`
})

const editMinStartDate = computed(() => {
  const status = Number(editForm.value.eventStatus)
  if (status === 2 || status === 3) return ''
  return new Date().toISOString().slice(0, 16)
})

const editMinEndDate = computed(() => {
  const status = Number(editForm.value.eventStatus)
  if (status === 2 || status === 3) return editForm.value.startDate || ''
  return editForm.value.startDate || new Date().toISOString().slice(0, 16)
})

const shiftDifficultyLabel = (d) => ({ 0: 'Einfach', 1: 'Mittel', 2: 'Schwer' }[d] ?? 'Einfach')
const shiftRatePerHour = (d) => ({ 0: 10, 1: 20, 2: 30 }[d] ?? 10)

const shiftDurationLabel = computed(() => {
  const sRaw = shiftForm.value.startTime || props.event?.startDate
  const eRaw = shiftForm.value.endTime || props.event?.endDate
  if (!sRaw || !eRaw) return '–'
  const h = (new Date(eRaw) - new Date(sRaw)) / (1000 * 60 * 60)
  if (h <= 0) return '–'
  return h < 1 ? `${Math.round(h * 60)} Min` : `${Math.round(h * 10) / 10} Std`
})

const shiftPointsPreview = computed(() => {
  const rate = shiftRatePerHour(shiftForm.value.difficulty)
  const sRaw = shiftForm.value.startTime || props.event?.startDate
  const eRaw = shiftForm.value.endTime || props.event?.endDate
  if (!sRaw || !eRaw) return '–'
  const hours = (new Date(eRaw) - new Date(sRaw)) / (1000 * 60 * 60)
  if (hours <= 0) return '–'
  return Math.max(1, Math.round(hours * rate))
})

// Helpers
const toLocal = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

const uploadImage = async (endpoint, file) => {
  const fd = new FormData()
  fd.append('file', file)
  await $fetch(endpoint, { method: 'POST', headers: { Authorization: getAuthHeader() }, body: fd })
}

// Open / close
watch(() => props.event, async (ev) => {
  if (!ev) return
  editImageFile.value = null
  editForm.value = {
    title: ev.title || '',
    description: ev.description || '',
    location: ev.location || '',
    startDate: toLocal(ev.startDate),
    endDate: toLocal(ev.endDate),
    eventStatus: ev.eventStatus ?? 0,
  }
  currentShifts.value = []
  shiftsToDelete.value = []
  resetShiftForm()

  try {
    const data = await $fetch(`${config.public.apiBase}/events/${ev.id}`, {
      params: { includeShifts: true },
      headers: { Authorization: getAuthHeader() },
    })
    const shifts = data.shifts || data.Shifts || []
    for (const shift of shifts) {
      try {
        shift.helperList = await $fetch(`${config.public.apiBase}/participation/shift/${shift.id}`, {
          headers: { Authorization: getAuthHeader() },
        })
      } catch { shift.helperList = [] }
    }
    currentShifts.value = shifts
  } catch (e) {
    console.error('Fehler beim Laden der Edit-Daten:', e)
  }
}, { immediate: false })

const close = () => {
  const eventId = props.event?.id
  emit('update:modelValue', false)
  emit('closed', eventId)
}

// Save event
const save = async () => {
  if (!props.event) return
  saving.value = true
  try {
    await authenticatedFetch(`${config.public.apiBase}/events/${props.event.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        id: props.event.id,
        title: editForm.value.title,
        description: editForm.value.description,
        location: editForm.value.location,
        startDate: editForm.value.startDate,
        endDate: editForm.value.endDate,
        organizationId: props.event.organizationId,
        eventStatus: parseInt(editForm.value.eventStatus),
      }),
    })
    if (editImageFile.value) {
      await uploadImage(`${config.public.apiBase}/events/${props.event.id}/image`, editImageFile.value)
      editImageFile.value = null
    }
    for (const shiftId of shiftsToDelete.value) {
      try { await authenticatedFetch(`${config.public.apiBase}/shifts/${shiftId}`, { method: 'DELETE' }) } catch { }
    }
    shiftsToDelete.value = []
    const eventId = props.event.id
    emit('update:modelValue', false)
    emit('saved', eventId)
  } catch (e) {
    await showDialogAlert('Fehler beim Aktualisieren des Events.')
    console.error(e)
  } finally {
    saving.value = false
  }
}

// Shift management
const resetShiftForm = () => {
  showShiftForm.value = false
  shiftImageFile.value = null
  shiftForm.value = {
    id: null, name: '', description: '', requiredHelpers: 1, ageRestriction: 0,
    difficulty: 0, startTime: toLocal(props.event?.startDate), endTime: toLocal(props.event?.endDate), categoryIds: [],
  }
}

const startAddShift = () => { resetShiftForm(); showShiftForm.value = true }
const editShift = (shift) => {
  shiftForm.value = {
    ...shift,
    difficulty: shift.difficulty ?? 0,
    startTime: toLocal(shift.startTime),
    endTime: toLocal(shift.endTime),
    categoryIds: (shift.categories ?? []).map(c => c.id),
  }
  showShiftForm.value = true
}
const toggleShiftCategory = (id) => {
  const idx = shiftForm.value.categoryIds.indexOf(id)
  if (idx === -1) shiftForm.value.categoryIds.push(id)
  else shiftForm.value.categoryIds.splice(idx, 1)
}

const saveShift = async () => {
  if (!shiftForm.value.name) { await showDialogAlert('Bitte geben Sie einen Namen ein.'); return }
  if (shiftForm.value.requiredHelpers < 1) { await showDialogAlert('Mindestens 1 Helfer erforderlich.'); return }
  if (!props.event) return

  try {
    const isEdit = !!shiftForm.value.id
    const url = isEdit
      ? `${config.public.apiBase}/shifts/${shiftForm.value.id}`
      : `${config.public.apiBase}/shifts`
    const res = await authenticatedFetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify({ ...shiftForm.value, eventId: props.event.id }),
    })
    if (shiftImageFile.value) {
      let shiftId = shiftForm.value.id
      if (!isEdit) { const created = await res.json(); shiftId = created?.id }
      if (shiftId) await uploadImage(`${config.public.apiBase}/shifts/${shiftId}/image`, shiftImageFile.value)
    }
    resetShiftForm()
    // Reload shifts
    const data = await $fetch(`${config.public.apiBase}/events/${props.event.id}`, {
      params: { includeShifts: true },
      headers: { Authorization: getAuthHeader() },
    })
    const shifts = data.shifts || data.Shifts || []
    for (const s of shifts) {
      const existing = currentShifts.value.find(cs => cs.id === s.id)
      s.helperList = existing?.helperList || []
    }
    currentShifts.value = shifts.filter(s => !shiftsToDelete.value.includes(s.id))
  } catch (e) {
    await showDialogAlert('Fehler beim Speichern des Dienstes.')
  }
}

const removeShift = async (shiftId) => {
  if (!await showDialogConfirm('Dienst löschen?')) return
  currentShifts.value = currentShifts.value.filter(s => s.id !== shiftId)
  if (shiftId) shiftsToDelete.value.push(shiftId)
}

// Helper actions
const updateHelperStatus = async (helper, status) => {
  helper._updating = true
  try {
    const res = await authenticatedFetch(
      `${config.public.apiBase}/Participation/status?userId=${helper.userId}&shiftId=${helper.shiftId}&status=${status}`,
      { method: 'PUT' }
    )
    if (res && res.ok) { helper.status = status }
    else { await showDialogAlert('Fehler beim Aktualisieren des Status.') }
  } catch { await showDialogAlert('Fehler beim Aktualisieren des Status.') }
  finally { helper._updating = false }
}

const confirmHelper = (h) => updateHelperStatus(h, 1)
const rejectHelper = (h) => updateHelperStatus(h, 3)
</script>
