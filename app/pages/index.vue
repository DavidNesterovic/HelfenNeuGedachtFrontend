<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
    <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold">H</div>
    <p class="text-gray-400 text-sm">Einen Moment bitte...</p>
  </div>
</template>

<script setup>
import { isAuthenticated, getHomeRoute } from '~/assets/utils/auth'

definePageMeta({ layout: false })

onMounted(() => {
  if (isAuthenticated()) {
    navigateTo(getHomeRoute())
  } else {
    navigateTo('/login')
  }
})
</script>
