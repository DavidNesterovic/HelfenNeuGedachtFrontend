<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
    <div class="mx-auto flex max-w-md items-center justify-around px-3 py-3">
      <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex min-w-[64px] flex-col items-center gap-1 text-sm"
          :class="isActive(item.to) ? 'text-blue-600' : 'text-slate-400'"
      >
        <span class="text-2xl leading-none">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()

const items = [
  { to: '/events', label: 'Einsätze', icon: '⌂' },
  { to: '/user/interested', label: 'Interessiert', icon: '♡' },
  { to: '/user/my-events', label: 'Meine', icon: '◫' },
  { to: '/user/profile', label: 'Profil', icon: '◌' },
]

const isActive = (path) => route.path === path
</script>