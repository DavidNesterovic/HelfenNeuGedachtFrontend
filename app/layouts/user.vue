<template>
  <div class="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col md:flex-row">

    <main class="flex-1 w-full px-4 pt-5 max-w-7xl mx-auto overflow-x-hidden main-content">
      <slot />
    </main>

    <div class="w-full md:w-auto">
      <BottomNav />
    </div>
  </div>
</template>

<style scoped>
.main-content {
  padding-bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 1.25rem;
  }
}
</style>
