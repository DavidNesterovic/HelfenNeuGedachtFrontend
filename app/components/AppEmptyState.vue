<template>
  <div class="flex flex-col items-center justify-center text-center px-6 py-16 max-w-sm mx-auto">
    <div v-if="$slots.icon" :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-5', iconBg]">
      <slot name="icon" />
    </div>
    <h3 class="text-base font-semibold text-slate-900">{{ heading }}</h3>
    <p v-if="subtext" class="mt-1.5 text-sm text-slate-500 leading-relaxed">{{ subtext }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  heading:  { type: String, required: true },
  subtext:  { type: String, default: '' },
  iconBg:   { type: String, default: 'bg-slate-100' },
})
</script>
