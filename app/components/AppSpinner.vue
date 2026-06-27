<template>
  <div :class="['flex flex-col items-center justify-center gap-3', paddingClasses[padding]]">
    <div :class="['border-4 border-blue-600 border-t-transparent rounded-full animate-spin', sizeClasses[size]]" />
    <p v-if="text" class="text-slate-400 text-sm font-medium">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text:    { type: String, default: '' },
  size:    { type: String, default: 'md' },
  padding: { type: String, default: 'lg' },
})

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const paddingClasses = {
  none: '',
  sm:   'py-8',
  md:   'py-12',
  lg:   'py-20',
}
</script>
