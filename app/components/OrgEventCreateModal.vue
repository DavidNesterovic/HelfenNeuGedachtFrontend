<template>
  <div v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">

      <div class="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <h2 class="text-xl font-bold text-slate-900">Neue Veranstaltung erstellen</h2>
        <button @click="close" class="text-slate-400 hover:text-slate-600">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
        <!-- Left: Event form -->
        <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-200">
          <form @submit.prevent="submit" class="space-y-4">
            <AppField v-model="newEvent.title" label="Titel" placeholder="Sommerfest" :required="true" />
            <AppField v-model="newEvent.description" type="textarea" label="Beschreibung" :rows="4" :required="true" />

            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-500 mb-1 uppercase">Bild <span class="font-normal normal-case text-slate-400">(optional)</span></label>
              <ImageUploadCrop :aspect-ratio="1" @change="f => imageFile = f" @clear="imageFile = null" />
            </div>

            <AppField v-model="newEvent.location" label="Ort" placeholder="Marktplatz" :required="true" />

            <div class="grid grid-cols-2 gap-2">
              <AppField v-model="newEvent.startDate" type="datetime-local" label="Start" :min="minDateTime" :required="true" />
              <AppField v-model="newEvent.endDate" type="datetime-local" label="Ende" :min="newEvent.startDate || minDateTime" :required="true" />
            </div>

            <div class="flex gap-4 pt-4">
              <AppButton type="submit" class="flex-1" size="lg" :loading="creating" :disabled="creating">
                {{ creating ? 'Wird erstellt...' : 'Veranstaltung erstellen' }}
              </AppButton>
              <AppButton type="button" variant="secondary" class="flex-1" size="lg" @click="close">Abbrechen</AppButton>
            </div>
          </form>
        </div>

        <!-- Right: Shifts (built up locally, saved after event creation) -->
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
                <button v-for="cat in availableCategories" :key="cat.id" type="button" @click="toggleCategory(cat.id)"
                  :class="['px-3 py-1 rounded-full text-xs font-semibold border transition-colors', shiftForm.categoryIds.includes(cat.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400']">
                  {{ cat.name }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Bild <span class="font-normal normal-case text-slate-400">(optional)</span></label>
              <ImageUploadCrop :current-url="shiftImagePreview" :aspect-ratio="1" height="8rem" @change="f => shiftImageFile = f" @clear="shiftImageFile = null" />
            </div>
            <div class="flex gap-2">
              <AppButton @click="saveLocalShift" class="flex-1">{{ shiftForm.id !== null ? 'Aktualisieren' : 'Dienst speichern' }}</AppButton>
              <AppButton variant="secondary" @click="resetShiftForm" class="flex-1">Abbrechen</AppButton>
            </div>
          </div>

          <!-- Pending shifts list -->
          <div class="space-y-3 flex-1 overflow-y-auto">
            <div v-for="shift in newEventShifts" :key="shift.id"
              class="flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <h4 class="font-bold text-slate-900">{{ shift.name }}</h4>
                <p class="text-xs text-slate-500">
                  {{ shift.points }} Punkte
                  <span v-if="shift.ageRestriction"> | Mindestalter: {{ shift.ageRestriction }} J.</span>
                  | 0/{{ shift.requiredHelpers }} Helfer
                </p>
                <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                  <span v-for="cat in shift.categories" :key="cat.id"
                    class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">{{ cat.name }}</span>
                </div>
              </div>
              <div class="flex gap-2 font-bold uppercase text-xs shrink-0 ml-3">
                <button @click="editLocalShift(shift)" class="text-blue-600 hover:text-blue-800">Bearbeiten</button>
                <button @click="removeLocalShift(shift.id)" class="text-red-500 hover:text-red-700">Löschen</button>
              </div>
            </div>
            <div v-if="newEventShifts.length === 0" class="text-center py-8 text-slate-400 italic text-sm">
              Noch keine Dienste für dieses Event erstellt.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAuthHeader, authenticatedFetch, getUserInfo } from '~/assets/utils/auth'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  apiBase: { type: String, default: '' },
  availableCategories: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'created'])

const config = useRuntimeConfig()
const { alert: showDialogAlert } = useDialog()

const newEvent = ref({ title: '', location: '', startDate: '', endDate: '', description: '' })
const newEventShifts = ref([])
const imageFile = ref(null)

const showShiftForm = ref(false)
const shiftForm = ref({ id: null, name: '', description: '', requiredHelpers: 1, ageRestriction: 0, difficulty: 0, startTime: '', endTime: '', categoryIds: [] })
const shiftImageFile = ref(null)
const creating = ref(false)

const minDateTime = computed(() => new Date().toISOString().slice(0, 16))

const shiftDifficultyLabel = (d) => ({ 0: 'Einfach', 1: 'Mittel', 2: 'Schwer' }[d] ?? 'Einfach')
const shiftRatePerHour = (d) => ({ 0: 10, 1: 20, 2: 30 }[d] ?? 10)

const shiftDurationLabel = computed(() => {
  const sRaw = shiftForm.value.startTime || newEvent.value.startDate
  const eRaw = shiftForm.value.endTime || newEvent.value.endDate
  if (!sRaw || !eRaw) return '–'
  const h = (new Date(eRaw) - new Date(sRaw)) / (1000 * 60 * 60)
  if (h <= 0) return '–'
  return h < 1 ? `${Math.round(h * 60)} Min` : `${Math.round(h * 10) / 10} Std`
})

const shiftPointsPreview = computed(() => {
  const rate = shiftRatePerHour(shiftForm.value.difficulty)
  const sRaw = shiftForm.value.startTime || newEvent.value.startDate
  const eRaw = shiftForm.value.endTime || newEvent.value.endDate
  if (!sRaw || !eRaw) return '–'
  const hours = (new Date(eRaw) - new Date(sRaw)) / (1000 * 60 * 60)
  if (hours <= 0) return '–'
  return Math.max(1, Math.round(hours * rate))
})

const shiftImagePreview = computed(() => {
  if (shiftImageFile.value) {
    try { return URL.createObjectURL(shiftImageFile.value) } catch { return null }
  }
  return null
})

// Reset when closed
watch(() => props.modelValue, (open) => {
  if (!open) return
  newEvent.value = { title: '', location: '', startDate: '', endDate: '', description: '' }
  newEventShifts.value = []
  imageFile.value = null
  resetShiftForm()
})

const close = () => emit('update:modelValue', false)

// Shift form helpers
const resetShiftForm = () => {
  showShiftForm.value = false
  shiftImageFile.value = null
  shiftForm.value = { id: null, name: '', description: '', requiredHelpers: 1, ageRestriction: 0, difficulty: 0, startTime: '', endTime: '', categoryIds: [] }
}

const startAddShift = () => { resetShiftForm(); showShiftForm.value = true }

const toggleCategory = (id) => {
  const idx = shiftForm.value.categoryIds.indexOf(id)
  if (idx === -1) shiftForm.value.categoryIds.push(id)
  else shiftForm.value.categoryIds.splice(idx, 1)
}

const calcPoints = () => {
  const rate = shiftRatePerHour(shiftForm.value.difficulty)
  const sRaw = shiftForm.value.startTime || newEvent.value.startDate
  const eRaw = shiftForm.value.endTime || newEvent.value.endDate
  if (!sRaw || !eRaw) return 10
  const h = (new Date(eRaw) - new Date(sRaw)) / (1000 * 60 * 60)
  return h > 0 ? Math.max(1, Math.round(h * rate)) : 10
}

const saveLocalShift = async () => {
  if (!shiftForm.value.name) { await showDialogAlert('Bitte geben Sie einen Namen ein.'); return }
  const isEdit = shiftForm.value.id !== null
  const cats = props.availableCategories.filter(c => shiftForm.value.categoryIds.includes(c.id))
  const shiftData = {
    id: isEdit ? shiftForm.value.id : -(Date.now()),
    name: shiftForm.value.name,
    description: shiftForm.value.description,
    requiredHelpers: shiftForm.value.requiredHelpers,
    ageRestriction: shiftForm.value.ageRestriction || 0,
    difficulty: shiftForm.value.difficulty,
    startTime: shiftForm.value.startTime,
    endTime: shiftForm.value.endTime,
    points: calcPoints(),
    categories: cats,
    _imageFile: shiftImageFile.value,
  }
  if (isEdit) {
    const idx = newEventShifts.value.findIndex(s => s.id === shiftForm.value.id)
    if (idx !== -1) newEventShifts.value[idx] = { ...newEventShifts.value[idx], ...shiftData }
  } else {
    newEventShifts.value.push(shiftData)
  }
  resetShiftForm()
}

const editLocalShift = (shift) => {
  shiftForm.value = {
    id: shift.id,
    name: shift.name,
    description: shift.description,
    requiredHelpers: shift.requiredHelpers,
    ageRestriction: shift.ageRestriction || 0,
    difficulty: shift.difficulty,
    startTime: shift.startTime,
    endTime: shift.endTime,
    categoryIds: (shift.categories || []).map(c => c.id),
  }
  showShiftForm.value = true
}

const removeLocalShift = (id) => {
  newEventShifts.value = newEventShifts.value.filter(s => s.id !== id)
}

// Submit
const submit = async () => {
  const user = getUserInfo()
  creating.value = true
  try {
    const res = await authenticatedFetch(`${config.public.apiBase}/events`, {
      method: 'POST',
      body: JSON.stringify({ ...newEvent.value, organizationId: parseInt(user.OrganizationId), status: 0 }),
    })
    const created = await res.json()

    if (imageFile.value && created?.id) {
      const fd = new FormData()
      fd.append('file', imageFile.value)
      await $fetch(`${config.public.apiBase}/events/${created.id}/image`, {
        method: 'POST', headers: { Authorization: getAuthHeader() }, body: fd,
      })
    }

    if (created?.id && newEventShifts.value.length > 0) {
      for (const shift of newEventShifts.value) {
        const shiftRes = await authenticatedFetch(`${config.public.apiBase}/shifts`, {
          method: 'POST',
          body: JSON.stringify({
            name: shift.name, description: shift.description,
            requiredHelpers: shift.requiredHelpers, ageRestriction: shift.ageRestriction || 0,
            difficulty: shift.difficulty, startTime: shift.startTime, endTime: shift.endTime,
            eventId: created.id, categoryIds: (shift.categories || []).map(c => c.id),
          }),
        })
        if (shift._imageFile) {
          const s = await shiftRes.json()
          if (s?.id) {
            const fd = new FormData()
            fd.append('file', shift._imageFile)
            await $fetch(`${config.public.apiBase}/shifts/${s.id}/image`, {
              method: 'POST', headers: { Authorization: getAuthHeader() }, body: fd,
            })
          }
        }
      }
    }

    emit('update:modelValue', false)
    emit('created')
  } catch (e) {
    await showDialogAlert('Fehler beim Speichern der Veranstaltung.')
    console.error(e)
  } finally {
    creating.value = false
  }
}
</script>
