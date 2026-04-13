<template>
  <button
      type="button"
      class="whitespace-nowrap rounded-full border px-4 py-2 text-sm transition"
      :class="active
      ? 'border-transparent bg-slate-200 text-slate-800'
      : 'border-slate-300 bg-white text-slate-700'"
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