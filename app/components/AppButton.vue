<template>
  <component
    :is="as"
    v-bind="as === 'button' ? { type } : {}"
    :disabled="as === 'button' ? (disabled || loading) : undefined"
    :class="[
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      variantClasses[variant] ?? variantClasses.primary,
      sizeClasses[size] ?? sizeClasses.md,
    ]"
  >
    <svg v-if="loading" class="animate-spin shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </component>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  as: { type: [String, Object], default: 'button' },
})

const variantClasses = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
  secondary: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-300',
  danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-300',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
  warning:   'bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-amber-400',
  purple:    'bg-purple-600 hover:bg-purple-700 text-white shadow-sm focus:ring-purple-500',
  ghost:     'text-blue-600 hover:bg-blue-50 focus:ring-blue-300',
  muted:     'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-300',
}

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-sm',
  xl: 'px-10 py-3.5 text-base',
}
</script>
