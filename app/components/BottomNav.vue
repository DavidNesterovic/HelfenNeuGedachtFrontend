<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white nav-safe">
    <div class="mx-auto flex max-w-md items-center justify-around px-3 py-3">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-w-[64px] flex-col items-center gap-1 text-sm"
        :class="isActive(item.to) ? 'text-blue-600' : 'text-slate-400'"
      >
        <span class="relative">
          <!-- Profile tab: show avatar or fallback icon -->
          <span v-if="item.isProfile" class="block w-7 h-7">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              alt="Profil"
              class="w-7 h-7 rounded-full object-cover"
              :class="isActive(item.to) ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-200'"
            />
            <span v-else class="text-2xl leading-none">{{ item.icon }}</span>
          </span>
          <span v-else class="text-2xl leading-none">{{ item.icon }}</span>

          <span
            v-if="item.badge > 0"
            class="absolute -top-1 -right-2.5 min-w-[17px] h-[17px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </span>
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()
const { interestedCount, upcomingCount, refresh: refreshCounts } = useParticipationCounts()
const { avatarUrl, refresh: refreshUser } = useCurrentUser()

const items = computed(() => [
  { to: '/events',          label: 'Einsätze',    icon: '⌂', badge: 0 },
  { to: '/user/interested', label: 'Interessiert', icon: '♡', badge: interestedCount.value },
  { to: '/user/my-events',  label: 'Meine',        icon: '◫', badge: upcomingCount.value },
  { to: '/user/profile',    label: 'Profil',       icon: '◌', badge: 0, isProfile: true },
])

const isActive = (path) => route.path === path

onMounted(() => {
  refreshCounts()
  refreshUser()
})
</script>

<style scoped>
.nav-safe {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
}
</style>
