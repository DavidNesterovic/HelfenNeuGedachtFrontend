<template>
  <div v-if="modelValue && event"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">

      <!-- Header with workflow actions -->
      <div class="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
        <h2 class="text-xl font-bold text-slate-900">Veranstaltungsdetails</h2>
        <div class="flex items-center gap-2 flex-wrap">
          <button v-if="status === 0" @click="$emit('publish', event)"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            VERÖFFENTLICHEN
          </button>
          <button v-if="status === 1" @click="$emit('complete', event)"
            class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ABSCHLIESSEN
          </button>
          <button v-if="status === 2" @click="$emit('rate', event)"
            class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            BEWERTEN
          </button>
          <button v-if="status === 0 || status === 1" @click="$emit('cancel', event)"
            class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-red-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ABSAGEN
          </button>
          <button v-if="status !== 2 && status !== 3" @click="$emit('edit', event)"
            class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            BEARBEITEN
          </button>
          <button @click="$emit('update:modelValue', false)" class="text-slate-400 hover:text-slate-600 ml-1">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
        <!-- Left: Event info -->
        <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-200 space-y-4">
          <div v-if="event.imageUrl" class="-mx-6 -mt-6 mb-2">
            <img :src="`${apiBase}${event.imageUrl}`" :alt="event.title" class="w-full h-48 object-cover" />
          </div>

          <div>
            <span class="block text-xs font-bold text-slate-400 uppercase">Titel</span>
            <span class="text-lg font-bold text-slate-800">{{ event.title }}</span>
          </div>
          <div>
            <span class="block text-xs font-bold text-slate-400 uppercase">Beschreibung</span>
            <p class="text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1">
              {{ event.description || 'Keine Beschreibung vorhanden.' }}
            </p>
          </div>
          <div>
            <span class="block text-xs font-bold text-slate-400 uppercase">Ort</span>
            <span class="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
              <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ event.location }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="block text-xs font-bold text-slate-400 uppercase">Start</span>
              <span class="text-sm font-semibold text-slate-700 mt-1 block">{{ formatDate(event.startDate) }}</span>
            </div>
            <div>
              <span class="block text-xs font-bold text-slate-400 uppercase">Ende</span>
              <span class="text-sm font-semibold text-slate-700 mt-1 block">{{ formatDate(event.endDate) }}</span>
            </div>
          </div>
          <div>
            <span class="block text-xs font-bold text-slate-400 uppercase">Status</span>
            <div class="mt-1">
              <span :class="getStatusBadgeClass(event.eventStatus)" class="px-2.5 py-1 rounded-full text-xs font-semibold border inline-block">
                {{ getStatusLabel(event.eventStatus) }}
              </span>
              <div v-if="needsAttention(event)" class="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                <svg class="w-4 h-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>{{ getAttentionHint(event) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Shifts + helpers -->
        <div class="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Dienste</h3>

          <AppSpinner v-if="loadingShifts" text="Lade Dienste..." padding="sm" />

          <div v-else class="space-y-3 flex-1 overflow-y-auto">
            <div v-for="shift in currentShifts" :key="shift.id"
              class="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <h4 class="font-bold text-slate-900">{{ shift.name }}</h4>
              <p class="text-xs text-slate-500">
                {{ shift.points }} Punkte
                <span v-if="shift.ageRestriction"> | Mindestalter: {{ shift.ageRestriction }} J.</span>
                | {{ getConfirmedHelpers(shift).length }}/{{ shift.requiredHelpers }} Helfer
              </p>
              <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                <span v-for="cat in shift.categories" :key="cat.id"
                  class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">{{ cat.name }}</span>
              </div>

              <!-- Helper sections -->
              <div class="mt-4 bg-slate-50 rounded-lg overflow-hidden">
                <h5 class="text-xs font-black uppercase text-slate-400 px-3 pt-3 pb-2">Helfer:innen</h5>

                <template v-if="getInterestedHelpers(shift).length > 0">
                  <div class="px-3 pb-1.5">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vorgemerkt ({{ getInterestedHelpers(shift).length }})</span>
                  </div>
                  <div v-for="h in getInterestedHelpers(shift)" :key="'i-'+h.userId"
                    class="flex items-center px-3 py-1.5 border-t border-slate-100 gap-2 text-sm text-slate-500">
                    <HelperAvatar :helper="h" :api-base="apiBase" ring-color="ring-slate-200" bg-color="bg-slate-200" icon-color="text-slate-400" />
                    <span @click="activeUserId = h.userId" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150">{{ h.userName }}</span>
                  </div>
                </template>

                <template v-if="getAppliedHelpers(shift).length > 0">
                  <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 }">
                    <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Angemeldet ({{ getAppliedHelpers(shift).length }})</span>
                  </div>
                  <div v-for="h in getAppliedHelpers(shift)" :key="'a-'+h.userId"
                    class="flex items-center px-3 py-1.5 border-t border-slate-100 gap-2 text-sm text-slate-700 min-w-0">
                    <HelperAvatar :helper="h" :api-base="apiBase" ring-color="ring-amber-200" bg-color="bg-amber-100" icon-color="text-amber-400" />
                    <span @click="activeUserId = h.userId" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150">{{ h.userName }}</span>
                  </div>
                </template>

                <template v-if="getConfirmedHelpers(shift).length > 0">
                  <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 || getAppliedHelpers(shift).length > 0 }">
                    <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Bestätigt ({{ getConfirmedHelpers(shift).length }})</span>
                  </div>
                  <div v-for="h in getConfirmedHelpers(shift)" :key="'c-'+h.userId"
                    class="flex items-center px-3 py-1.5 border-t border-slate-100 gap-2 text-sm text-slate-700">
                    <HelperAvatar :helper="h" :api-base="apiBase" ring-color="ring-emerald-200" bg-color="bg-emerald-100" icon-color="text-emerald-500" />
                    <span @click="activeUserId = h.userId" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150">{{ h.userName }}</span>
                  </div>
                </template>

                <div v-if="getInterestedHelpers(shift).length === 0 && getAppliedHelpers(shift).length === 0 && getConfirmedHelpers(shift).length === 0"
                  class="px-3 pb-3 text-xs text-slate-400 italic">Noch keine Helfer:innen eingetragen</div>
                <div class="pb-1"></div>
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
import { getAuthHeader } from '~/assets/utils/auth'
import { useEventStatus } from '~/composables/useEventStatus'

const HelperAvatar = defineComponent({
  props: { helper: Object, apiBase: String, ringColor: String, bgColor: String, iconColor: String },
  template: `
    <template v-if="helper.avatarUrl">
      <img :src="apiBase + helper.avatarUrl" :alt="helper.userName"
        class="w-6 h-6 rounded-full object-cover shrink-0" :class="'ring-1 ' + ringColor" />
    </template>
    <div v-else class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" :class="bgColor">
      <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" :class="iconColor" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  `,
})

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  event: { type: Object, default: null },
  apiBase: { type: String, default: '' },
})

defineEmits(['update:modelValue', 'edit', 'publish', 'cancel', 'complete', 'rate'])

const config = useRuntimeConfig()
const { alert: showDialogAlert, confirm: showDialogConfirm } = useDialog()
const { normalizeStatus, getStatusLabel, getStatusBadgeClass, needsAttention, getAttentionHint, formatDate, getInterestedHelpers, getAppliedHelpers, getConfirmedHelpers } = useEventStatus()

const currentShifts = ref([])
const loadingShifts = ref(false)
const activeUserId = ref(null)

const status = computed(() => normalizeStatus(props.event?.eventStatus))

watch(() => props.event, async (ev) => {
  if (!ev) return
  currentShifts.value = []
  loadingShifts.value = true
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
    console.error('Fehler beim Laden der Event-Details:', e)
  } finally {
    loadingShifts.value = false
  }
}, { immediate: false })
</script>
