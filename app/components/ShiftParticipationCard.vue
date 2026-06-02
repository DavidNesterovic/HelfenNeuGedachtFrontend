<template>
  <div class="rounded-[28px] bg-white p-5 shadow-sm border border-blue-100">
    <component
      :is="to ? NuxtLink : 'div'"
      :to="to"
      class="flex gap-4"
      :class="to ? 'hover:opacity-90 transition-opacity' : ''"
    >
      <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
        <img
          v-if="participation.shiftImageUrl"
          :src="`${apiBase}${participation.shiftImageUrl}`"
          :alt="participation.shiftName"
          class="h-full w-full object-cover"
        />
        <div v-else class="h-full w-full flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-[17px] leading-tight font-medium text-slate-900 truncate">{{ participation.eventName ?? participation.shiftName }}</h3>
        <p class="mt-1 text-[15px] text-blue-600 truncate">{{ participation.shiftName }}</p>
        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
          <span v-if="participation.eventStartDate">{{ formatEventDate(participation.eventStartDate) }}</span>
          <span v-if="participation.eventLocation">{{ participation.eventLocation }}</span>
        </div>
      </div>
    </component>

    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
      <span v-if="participation.shiftPoints" class="rounded-xl bg-amber-50 px-3 py-1 text-sm text-amber-600">
        +{{ participation.shiftPoints }} Punkte
      </span>
      <span v-else class="rounded-xl bg-slate-100 px-3 py-1 text-sm text-slate-500">Einsatz</span>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import { NuxtLink } from '#components'

defineProps({
  participation: { type: Object, required: true },
  to: { type: String, default: null },
})

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase.replace('/api', ''))

const formatEventDate = (dateStr) => {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('de-AT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}
</script>
