<template>
  <img v-if="helper.avatarUrl" :src="apiBase + helper.avatarUrl" :alt="helper.userName"
    class="w-6 h-6 rounded-full object-cover shrink-0" :class="'ring-1 ' + ringColor" />
  <div v-else class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" :class="bgColor">
    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" :class="iconColor" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  helper: { type: Object, required: true },
  apiBase: { type: String, default: '' },
  ringColor: { type: String, default: 'ring-slate-200' },
  bgColor: { type: String, default: 'bg-slate-200' },
  iconColor: { type: String, default: 'text-slate-400' },
})
</script>
