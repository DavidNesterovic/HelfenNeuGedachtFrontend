<template>
  <div
    v-if="message"
    :class="[
      'rounded-lg border-l-4 px-4 py-3 text-sm',
      variantClasses[type] ?? variantClasses.error,
    ]"
    role="alert"
  >
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'error' },
  message: { type: String, default: '' },
})

const variantClasses = {
  success: 'bg-emerald-50 border-emerald-500 text-emerald-700',
  error:   'bg-red-50 border-red-500 text-red-700',
  warning: 'bg-amber-50 border-amber-500 text-amber-700',
  info:    'bg-blue-50 border-blue-500 text-blue-700',
}
</script>
