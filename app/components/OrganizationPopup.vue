<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closePopup"
    >
      <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col transform transition-all duration-300 scale-100">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Organisation</h3>
          <button @click="closePopup" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center py-12 space-y-3">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm text-slate-500 font-semibold">Lade Organisationsdaten...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8 text-red-500 font-semibold space-y-2">
            <svg class="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm">{{ error }}</p>
            <AppButton variant="muted" size="xs" class="mt-4" @click="closePopup">Schließen</AppButton>
          </div>

          <!-- Data Display -->
          <div v-else-if="orgData" class="space-y-6">
            <!-- Organization Name & Type -->
            <div class="border-b border-slate-100 pb-4">
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xl font-bold text-slate-900 leading-snug">{{ orgData.name }}</h4>
                <span v-if="orgData.type" class="shrink-0 text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                  {{ orgData.type }}
                </span>
              </div>
              <p v-if="orgData.description" class="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                {{ orgData.description }}
              </p>
            </div>

            <!-- Detail Information -->
            <div class="space-y-4 text-sm text-slate-700">
              <!-- Address info -->
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span class="block font-bold text-xs text-slate-400 uppercase tracking-wide">Adresse</span>
                  <span>{{ orgData.street }}</span>
                  <span class="block">{{ orgData.postalCode }} {{ orgData.city }}</span>
                  <span v-if="orgData.state || orgData.country" class="block text-xs text-slate-500">
                    {{ [orgData.state, orgData.country].filter(Boolean).join(', ') }}
                  </span>
                </div>
              </div>

              <!-- Contact Person -->
              <div v-if="orgData.contactPersonName" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <span class="block font-bold text-xs text-slate-400 uppercase tracking-wide">Ansprechpartner</span>
                  <span class="font-semibold">{{ orgData.contactPersonName }}</span>
                  <span v-if="orgData.contactPersonRole" class="text-xs text-slate-500"> ({{ orgData.contactPersonRole }})</span>
                </div>
              </div>
              
              <!-- Contact Methods -->
              <div class="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <!-- Website -->
                <div v-if="orgData.website" class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a :href="websiteUrl" target="_blank" rel="noopener" class="text-blue-600 font-semibold hover:underline truncate">
                    {{ orgData.website }}
                  </a>
                </div>

                <!-- Contact Email -->
                <div v-if="orgData.contactEmail" class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a :href="'mailto:' + orgData.contactEmail" class="text-blue-600 font-semibold hover:underline truncate">
                    {{ orgData.contactEmail }}
                  </a>
                </div>

                <!-- Contact Phone -->
                <div v-if="orgData.contactPhone" class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a :href="'tel:' + orgData.contactPhone" class="text-blue-600 font-semibold hover:underline">
                    {{ orgData.contactPhone }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Close Button -->
            <AppButton class="w-full" @click="closePopup">Schließen</AppButton>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { getAuthHeader } from '~/assets/utils/auth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  orgId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close'])

const config = useRuntimeConfig()
const orgData = ref(null)
const loading = ref(false)
const error = ref(null)

const websiteUrl = computed(() => {
  const ws = orgData.value?.website
  if (!ws) return ''
  if (ws.startsWith('http://') || ws.startsWith('https://')) return ws
  return `https://${ws}`
})

const fetchOrgDetails = async (id) => {
  if (!id) return
  loading.value = true
  error.value = null
  orgData.value = null
  try {
    const data = await $fetch(`${config.public.apiBase}/organization/${id}`, {
      headers: { Authorization: getAuthHeader() }
    })
    orgData.value = data
  } catch (err) {
    console.error('Fehler beim Laden der Organisationsdetails:', err)
    error.value = 'Organisationsdetails konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

watch(() => props.orgId, (newId) => {
  if (props.show && newId) {
    fetchOrgDetails(newId)
  }
})

watch(() => props.show, (newShow) => {
  if (newShow && props.orgId) {
    fetchOrgDetails(props.orgId)
  }
})

const closePopup = () => {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
