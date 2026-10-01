<template>
  <div class="max-w-5xl mx-auto px-4 py-5 sm:px-6 lg:px-8">

    <div class="-mx-4 -mt-5 bg-blue-600 px-4 pt-6 pb-6 sm:mx-0 sm:mt-0 sm:rounded-2xl sm:shadow-md">
      <div class="max-w-3xl sm:mx-auto lg:max-w-none lg:flex lg:items-center lg:justify-between lg:gap-8">

        <div class="flex items-center gap-4">
          <ImageUploadCrop :circular="true" :current-url="avatarUrl" @change="handleAvatarFile">
          <template #trigger="{ open }">
            <button type="button" @click="open" class="relative group shrink-0">
              <div class="w-14 h-14 rounded-full overflow-hidden bg-blue-400/40 flex items-center justify-center">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                <svg v-else viewBox="0 0 24 24" class="h-8 w-8 text-white" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
              <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                <svg class="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
          </template>
        </ImageUploadCrop>
          <div>
            <p class="text-sm font-medium text-white/70">Dein Profil</p>
            <p class="text-xl font-semibold text-white leading-tight mt-0.5">{{ userName }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
      <div class="rounded-2xl bg-white p-3 sm:p-5 text-center shadow-sm border border-slate-100/50">
        <svg viewBox="0 0 24 24" class="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 mx-auto mb-1" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
        <p class="text-xl sm:text-2xl font-bold text-slate-900">{{ totalEinsaetze }}</p>
        <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Einsätze</p>
      </div>
      <div class="rounded-2xl bg-white p-3 sm:p-5 text-center shadow-sm border border-slate-100/50">
        <svg viewBox="0 0 24 24" class="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 mx-auto mb-1" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xl sm:text-2xl font-bold text-slate-900">{{ totalStunden }}</p>
        <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Stunden</p>
      </div>
      <div class="rounded-2xl bg-white p-3 sm:p-5 text-center shadow-sm border border-slate-100/50">
        <svg viewBox="0 0 24 24" class="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 mx-auto mb-1" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <p class="text-xl sm:text-2xl font-bold text-slate-900">{{ totalPunkte }}</p>
        <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Punkte</p>
      </div>
    </div>



    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 lg:gap-x-8">
      <div class="mt-6">
        <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Präferenzen</h2>
        <div class="rounded-2xl bg-white shadow-sm border border-slate-100/50 overflow-hidden">
          <div>
            <button
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 text-left hover:bg-slate-50 transition"
              @click="showCategoryPicker = !showCategoryPicker"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.74 0-3.27.81-4 2.03-.73-1.22-2.26-2.03-4-2.03-2.761 0-5 2.015-5 4.5 0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span class="flex-1 text-[14px] text-slate-700">Interessengebiete</span>
              <span class="text-[13px] text-indigo-500 font-medium">
                {{ categoryPreferenceLabel }}
              </span>
            </button>
            <div v-if="showCategoryPicker" class="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
              <button
                v-for="cat in allCategories"
                :key="cat.id"
                type="button"
                @click="toggleCategoryPreference(cat.id)"
                :class="[
                  'px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors',
                  selectedCategoryIds.includes(cat.id)
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                ]"
              >{{ cat.name }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 mb-8 md:mt-12 flex items-end">
        <button
          class="w-full rounded-2xl bg-white border border-red-100 hover:bg-red-50/50 shadow-sm px-4 py-3.5 flex items-center gap-3 text-red-500 transition group"
          @click="handleLogout"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
          <span class="text-[14px] font-medium">Abmelden</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { getAuthHeader, getUserInfo, logout } from '~/assets/utils/auth.js'

definePageMeta({ layout: 'user', middleware: 'auth' })

const config = useRuntimeConfig()
const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
const pending = ref(true)
const participations = ref([])
const notifications = ref(true)
const userMe = ref(null)

const { refresh: refreshNavUser } = useCurrentUser()

const userInfo = getUserInfo()
const userName = computed(() => userMe.value?.userName ?? userMe.value?.username ?? userInfo?.name ?? userInfo?.unique_name ?? userInfo?.email ?? 'Benutzer')
const avatarUrl = computed(() => userMe.value?.avatarUrl ? `${apiBase.value}${userMe.value.avatarUrl}` : null)

const handleAvatarFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  try {
    await $fetch(`${config.public.apiBase}/User/avatar`, {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      body: formData,
    })
    const updated = await $fetch(`${config.public.apiBase}/User/me`, {
      headers: { Authorization: getAuthHeader() },
    })
    userMe.value = updated
    refreshNavUser()
  } catch (e) {
    console.error('Fehler beim Hochladen des Profilbilds:', e)
  }
}

const formattedDateOfBirth = computed(() => {
  const dob = userMe.value?.dateOfBirth
  if (!dob) return ''
  const date = new Date(dob)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

const completedParticipations = computed(() =>
  participations.value.filter(p => p.status === 'Completed')
)

const totalEinsaetze = computed(() => userMe.value?.completedParticipations ?? completedParticipations.value.length)

const totalPunkte = computed(() =>
  userMe.value?.points ?? completedParticipations.value.reduce((sum, p) => sum + (p.shift?.points ?? 0), 0)
)

const totalStunden = computed(() => {
  const hrs = completedParticipations.value.reduce((sum, p) => {
    const start = new Date(p.shift?.event?.startDate).getTime()
    const end = new Date(p.shift?.event?.endDate).getTime()
    if (isNaN(start) || isNaN(end) || end <= start) return sum
    return sum + (end - start) / (1000 * 60 * 60)
  }, 0)
  return Math.round(hrs)
})

const LEVEL_THRESHOLDS = { Bronze: 0, Silber: 50, Gold: 200 }

const currentLevel = computed(() => {
  const pts = totalPunkte.value
  if (pts >= LEVEL_THRESHOLDS.Gold) return 'Gold'
  if (pts >= LEVEL_THRESHOLDS.Silber) return 'Silber'
  return 'Bronze'
})

const nextLevel = computed(() => {
  if (currentLevel.value === 'Bronze') return 'Silber'
  if (currentLevel.value === 'Silber') return 'Gold'
  return 'Gold'
})

const pointsToNextLevel = computed(() => {
  if (currentLevel.value === 'Bronze') return Math.max(0, LEVEL_THRESHOLDS.Silber - totalPunkte.value)
  if (currentLevel.value === 'Silber') return Math.max(0, LEVEL_THRESHOLDS.Gold - totalPunkte.value)
  return 0
})

const progressPercent = computed(() => {
  const pts = totalPunkte.value
  if (currentLevel.value === 'Bronze') return Math.min(100, (pts / LEVEL_THRESHOLDS.Silber) * 100)
  if (currentLevel.value === 'Silber') {
    return Math.min(100, ((pts - LEVEL_THRESHOLDS.Silber) / (LEVEL_THRESHOLDS.Gold - LEVEL_THRESHOLDS.Silber)) * 100)
  }
  return 100
})

const achievements = computed(() => [
  {
    emoji: '⭐',
    bg: 'bg-amber-50',
    name: 'Erste Schritte',
    description: 'Ersten Einsatz absolviert',
    unlocked: totalEinsaetze.value >= 1,
  },
  {
    emoji: '🔥',
    bg: 'bg-orange-50',
    name: 'Serienheld',
    description: '5 Einsätze in einem Monat',
    unlocked: totalEinsaetze.value >= 5,
  },
  {
    emoji: '❤️',
    bg: 'bg-red-50',
    name: 'Herzenssache',
    description: '10 Einsätze im Sozialbereich',
    unlocked: totalEinsaetze.value >= 10,
  },
])

const rewards = [
  { name: 'Kino-Gutschein', cost: 50 },
  { name: 'Restaurant-Gutschein', cost: 100 },
  { name: 'Konzert-Ticket', cost: 200 },
]

const handleLogout = () => logout()

const allCategories = ref([])
const selectedCategoryIds = ref([])
const showCategoryPicker = ref(false)

const categoryPreferenceLabel = computed(() => {
  if (selectedCategoryIds.value.length === 0) return 'Keine'
  const names = allCategories.value
    .filter(c => selectedCategoryIds.value.includes(c.id))
    .map(c => c.name)
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
})

const toggleCategoryPreference = async (id) => {
  const idx = selectedCategoryIds.value.indexOf(id)
  if (idx === -1) selectedCategoryIds.value.push(id)
  else selectedCategoryIds.value.splice(idx, 1)

  try {
    await $fetch(`${config.public.apiBase}/users/preferences`, {
      method: 'PUT',
      headers: { Authorization: getAuthHeader() },
      body: selectedCategoryIds.value,
    })
  } catch (e) {
    console.error('Fehler beim Speichern der Präferenzen:', e)
    if (idx === -1) selectedCategoryIds.value.pop()
    else selectedCategoryIds.value.splice(idx, 0, id)
  }
}

onMounted(async () => {
  try {
    const [participationsRes, categoriesRes, preferencesRes, meRes] = await Promise.allSettled([
      $fetch(`${config.public.apiBase}/Participation/user`, {
        headers: { Authorization: getAuthHeader() },
      }),
      $fetch(`${config.public.apiBase}/categories`),
      $fetch(`${config.public.apiBase}/users/preferences`, {
        headers: { Authorization: getAuthHeader() },
      }),
      $fetch(`${config.public.apiBase}/User/me`, {
        headers: { Authorization: getAuthHeader() },
      }),
    ])

    if (participationsRes.status === 'fulfilled') participations.value = participationsRes.value || []
    if (categoriesRes.status === 'fulfilled') allCategories.value = categoriesRes.value || []
    if (preferencesRes.status === 'fulfilled') {
      selectedCategoryIds.value = (preferencesRes.value || []).map(c => c.id)
    }
    if (meRes.status === 'fulfilled') {
      userMe.value = meRes.value
    }
  } catch (e) {
    console.error(e)
  } finally {
    pending.value = false
  }
})
</script>
