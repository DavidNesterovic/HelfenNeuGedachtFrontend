<template>
  <button
      type="button"
      class="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition"
      :class="active
      ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1'
      : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:ring-slate-400'"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false,
  },
})
</script>