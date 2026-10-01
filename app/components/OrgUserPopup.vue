<template>
  <AppModal v-model="isOpen" title="Benutzerprofil" max-width="sm" @close="close">
    <AppSpinner v-if="loading" text="Lade Benutzerdaten..." padding="sm" />

    <div v-else-if="error" class="text-center py-6 space-y-3 text-red-500">
      <svg class="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p class="text-sm font-semibold">{{ error }}</p>
      <AppButton variant="muted" size="xs" @click="close">Schließen</AppButton>
    </div>

    <div v-else-if="user" class="w-full space-y-6">
      <div class="flex flex-col items-center pb-4 border-b border-slate-100">
        <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-black text-2xl flex items-center justify-center mb-3 shadow-inner">
          {{ user.userName ? user.userName.substring(0, 2).toUpperCase() : 'U' }}
        </div>
        <h4 class="text-lg font-bold text-slate-900">{{ user.userName }}</h4>
        <a :href="'mailto:' + user.email" class="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {{ user.email }}
        </a>
      </div>

      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Punkte</span>
          <span class="text-lg font-black text-amber-500 mt-1 block">{{ user.points }}</span>
        </div>
        <div class="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Einsätze</span>
          <span class="text-lg font-black text-slate-800 mt-1 block">{{ user.totalParticipations }}</span>
        </div>
        <div class="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span class="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Bewertung</span>
          <span class="text-lg font-black text-amber-500 mt-1 block">{{ user.averageRating ? user.averageRating.toFixed(1) : '–' }}</span>
          <span v-if="user.ratingCount" class="text-[9px] text-slate-400">({{ user.ratingCount }}×)</span>
        </div>
      </div>

      <AppButton class="w-full" @click="close">Schließen</AppButton>
    </div>
  </AppModal>
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth'

const props = defineProps({
  userId: { type: [String, Number], default: null },
})

const emit = defineEmits(['close'])

const config = useRuntimeConfig()
const isOpen = ref(false)
const loading = ref(false)
const error = ref(null)
const user = ref(null)

watch(() => props.userId, async (id) => {
  if (!id) { isOpen.value = false; return }
  isOpen.value = true
  loading.value = true
  error.value = null
  user.value = null
  try {
    user.value = await $fetch(`${config.public.apiBase}/user/${id}`, {
      headers: { Authorization: getAuthHeader() },
    })
  } catch (e) {
    error.value = 'Benutzerdetails konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
})

const close = () => {
  isOpen.value = false
  emit('close')
}
</script>
