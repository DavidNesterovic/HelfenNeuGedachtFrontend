<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" :class="dotColor"></span>
        {{ title }} ({{ events.length }})
      </h2>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th @click="$emit('sort', 'title')"
              class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none">
              <div class="flex items-center gap-1.5">
                <span>Veranstaltung</span>
                <SortIcon :sort-by="sortBy" asc="title-asc" desc="title-desc" />
              </div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Ort</th>
            <th @click="$emit('sort', 'date')"
              class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none">
              <div class="flex items-center justify-center gap-1.5">
                <span>Datum</span>
                <SortIcon :sort-by="sortBy" asc="date-asc" desc="date-desc" />
              </div>
            </th>
            <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Helfer</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Status</th>
            <th class="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase">Aktion</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100 text-sm">
          <tr v-for="event in events" :key="event.id" class="hover:bg-slate-50 transition-colors" :class="past ? 'opacity-80' : ''">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img v-if="event.imageUrl" :src="`${apiBase}${event.imageUrl}`" :alt="event.title" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div v-else class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span class="font-bold text-slate-900">{{ event.title }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-slate-600">{{ event.location }}</td>
            <td class="px-6 py-4 text-center text-slate-600">{{ formatDate(event.startDate) }}</td>
            <td class="px-6 py-4 text-center font-semibold text-blue-600">
              {{ event.promisedHelpers }}/{{ event.requiredHelpers }}
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="getStatusBadgeClass(event.eventStatus)" class="px-2.5 py-1 rounded-full text-xs font-semibold border">
                {{ getStatusLabel(event.eventStatus) }}
              </span>
              <div v-if="needsAttention(event)" class="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md" :title="getAttentionHint(event)">
                <svg class="w-3.5 h-3.5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span>Status prüfen</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <div class="flex justify-center gap-3 font-bold uppercase text-xs flex-wrap">
                <button @click="$emit('details', event)" class="text-blue-600 hover:text-blue-800">Details</button>

                <!-- Upcoming actions -->
                <template v-if="!past">
                  <button v-if="status(event) === 0" @click="$emit('publish', event)" class="text-emerald-600 hover:text-emerald-800">Veröffentlichen</button>
                  <button v-if="status(event) === 0 || status(event) === 1" @click="$emit('cancel', event)" class="text-orange-500 hover:text-orange-700">Absagen</button>
                  <button v-if="status(event) === 0" @click="$emit('delete', event.id)" class="text-red-500 hover:text-red-700">Löschen</button>
                </template>

                <!-- Past actions -->
                <template v-else>
                  <button v-if="status(event) === 1" @click="$emit('complete', event)" class="text-purple-600 hover:text-purple-800">Abschließen</button>
                  <button v-if="status(event) === 2" @click="$emit('rate', event)" class="text-amber-600 hover:text-amber-800">Bewerten</button>
                  <button v-if="status(event) === 0" @click="$emit('delete', event.id)" class="text-red-500 hover:text-red-700">Löschen</button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="events.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-slate-400 font-medium">
              Keine Veranstaltungen gefunden.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useEventStatus } from '~/composables/useEventStatus'

const SortIcon = defineComponent({
  props: { sortBy: String, asc: String, desc: String },
  template: `
    <svg v-if="sortBy === asc" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
    </svg>
    <svg v-else-if="sortBy === desc" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
    </svg>
    <svg v-else class="w-3.5 h-3.5 inline text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  `,
})

defineProps({
  title:    { type: String, required: true },
  dotColor: { type: String, default: 'bg-blue-500' },
  events:   { type: Array, default: () => [] },
  apiBase:  { type: String, default: '' },
  sortBy:   { type: String, default: 'date-asc' },
  past:     { type: Boolean, default: false },
})

defineEmits(['sort', 'details', 'publish', 'cancel', 'delete', 'complete', 'rate'])

const { normalizeStatus, getStatusLabel, getStatusBadgeClass, needsAttention, getAttentionHint, formatDate } = useEventStatus()
const status = (event) => normalizeStatus(event.eventStatus)
</script>
