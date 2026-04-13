<template>
  <div class="min-h-screen bg-[#F3F4F6] text-slate-900">
    <div class="mx-auto w-full max-w-[430px] min-h-screen bg-[#F3F4F6]">
      <main class="w-full px-4 pt-5 pb-24 overflow-x-hidden">
        <slot />
      </main>

      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import BottomNav from '~/components/BottomNav.vue'
</script>