<template>
  <div class="min-h-screen bg-[#F3F4F6] text-slate-900 flex flex-col md:flex-row">
    
    <main class="flex-1 w-full px-4 pt-5 pb-24 md:pb-5 max-w-7xl mx-auto overflow-x-hidden">
      <slot />
    </main>

    <div class="w-full md:w-auto">
      <BottomNav />
    </div>

  </div>
</template>