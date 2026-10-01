<template>
  <Teleport to="body">
    <div class="fixed bottom-24 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
      <TransitionGroup name="snack" tag="div" class="flex flex-col items-center gap-2 w-full max-w-sm">
        <div
          v-for="snack in snacks"
          :key="snack.id"
          class="pointer-events-auto w-full flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg text-sm font-medium"
          :class="{
            'bg-slate-900 text-white': snack.type === 'default' || !snack.type,
            'bg-emerald-600 text-white': snack.type === 'success',
            'bg-red-600 text-white': snack.type === 'error',
            'bg-amber-500 text-white': snack.type === 'warning',
          }"
        >
          <svg v-if="snack.type === 'success'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <svg v-else-if="snack.type === 'error'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ snack.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
const { snacks } = useSnackbar()
</script>

<style scoped>
.snack-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.snack-leave-active {
  transition: all 0.2s ease-in;
}
.snack-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
.snack-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
.snack-move {
  transition: transform 0.2s ease;
}
</style>
