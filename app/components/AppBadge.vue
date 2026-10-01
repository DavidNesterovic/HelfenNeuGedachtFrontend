<template>
  <span :class="['inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-sm font-semibold', variantClasses[variant] ?? variantClasses.neutral]">
    <slot />
  </span>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'neutral' },
})

const variantClasses = {
  neutral: 'bg-slate-100 border-slate-200 text-slate-500',
  info:    'bg-blue-50 border-blue-200 text-blue-600',
  indigo:  'bg-indigo-50 border-indigo-200 text-indigo-600',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  warning: 'bg-amber-50 border-amber-200 text-amber-600',
  danger:  'bg-red-50 border-red-200 text-red-600',
  purple:  'bg-purple-50 border-purple-200 text-purple-600',
}
</script>
