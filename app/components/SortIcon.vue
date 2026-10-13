<template>
  <svg v-if="sortBy === asc" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
  </svg>
  <svg v-else-if="sortBy === desc" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
  </svg>
  <svg v-else class="w-3.5 h-3.5 inline text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
  </svg>
</template>

<script setup>
defineProps({
  sortBy: { type: String, default: '' },
  asc: { type: String, required: true },
  desc: { type: String, required: true },
})
</script>
