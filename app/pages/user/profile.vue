<template>
  <div>
    <!-- Blue header – full bleed -->
    <div class="-mx-4 -mt-5 bg-blue-600 px-4 pt-6 pb-6">
      <p class="text-sm font-medium text-white/70 mb-4">Dein Profil</p>

      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-blue-400/40 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" class="h-8 w-8 text-white" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-semibold text-white leading-tight">{{ userName }}</p>
          <span class="mt-1 inline-block rounded-full bg-amber-500 text-white text-xs font-semibold px-2.5 py-0.5">
            {{ currentLevel }}
          </span>
        </div>
      </div>

      <div v-if="currentLevel !== 'Gold'" class="mt-5 bg-blue-700/50 rounded-2xl px-4 py-3">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs text-white/80">Fortschritt zu {{ nextLevel }}</span>
          <span class="text-xs text-amber-300 font-medium">{{ pointsToNextLevel }} Punkte</span>
        </div>
        <div class="h-2 bg-blue-900/40 rounded-full overflow-hidden">
          <div
            class="h-full bg-amber-400 rounded-full transition-all duration-500"
            :style="{ width: progressPercent + '%' }"
          />
        </div>
      </div>
      <div v-else class="mt-5 bg-blue-700/50 rounded-2xl px-4 py-3">
        <p class="text-xs text-white/80 text-center">Maximales Level erreicht 🏆</p>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-3 mt-4">
      <div class="rounded-2xl bg-white p-3 text-center shadow-sm">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-indigo-500 mx-auto mb-1" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
        <p class="text-xl font-bold text-slate-900">{{ totalEinsaetze }}</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Einsätze</p>
      </div>
      <div class="rounded-2xl bg-white p-3 text-center shadow-sm">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-indigo-500 mx-auto mb-1" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xl font-bold text-slate-900">{{ totalStunden }}</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Stunden</p>
      </div>
      <div class="rounded-2xl bg-white p-3 text-center shadow-sm">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-amber-400 mx-auto mb-1" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <p class="text-xl font-bold text-slate-900">{{ totalPunkte }}</p>
        <p class="text-[11px] text-slate-400 mt-0.5">Punkte</p>
      </div>
    </div>

    <!-- Certificate card -->
    <div class="mt-4 rounded-2xl bg-white px-4 py-4 shadow-sm flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012 10.875a3.375 3.375 0 00-3.375 3.375V18.75m-3.75-13.5a6 6 0 1112 0 6 6 0 01-12 0z" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-slate-900 text-[14px]">Engagement-Zertifikat</p>
        <p class="text-[12px] text-slate-400">Für Bewerbungen & Co.</p>
      </div>
      <button class="shrink-0 w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>
    </div>

    <!-- Auszeichnungen -->
    <div class="mt-6">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Auszeichnungen</h2>
      <div class="space-y-3">
        <div
          v-for="badge in achievements"
          :key="badge.name"
          class="rounded-2xl bg-white px-4 py-3.5 shadow-sm flex items-center gap-3"
        >
          <div :class="['w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl', badge.bg]">
            {{ badge.emoji }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 text-[14px]">{{ badge.name }}</p>
            <p class="text-[12px] text-slate-400">{{ badge.description }}</p>
          </div>
          <div
            v-if="badge.unlocked"
            class="shrink-0 w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div
            v-else
            class="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-slate-300" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Punkte einlösen -->
    <div class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[15px] font-semibold text-slate-900">Punkte einlösen</h2>
        <div class="flex items-center gap-1.5 bg-amber-50 rounded-full px-3 py-1">
          <svg viewBox="0 0 24 24" class="h-4 w-4 text-amber-400" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span class="text-sm font-semibold text-amber-600">{{ totalPunkte }}</span>
        </div>
      </div>
      <div class="space-y-3">
        <div
          v-for="reward in rewards"
          :key="reward.name"
          class="rounded-2xl bg-white px-4 py-3.5 shadow-sm flex items-center gap-3"
        >
          <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125 2.625 2.625 0 0012 4.875zM8.25 9.75h7.5M3.375 9.75h17.25M3 9.75a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 9.75a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9.75z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 text-[14px]">{{ reward.name }}</p>
            <p class="text-[12px] text-slate-400">{{ reward.cost }} Punkte</p>
          </div>
          <button
            :disabled="totalPunkte < reward.cost"
            :class="[
              'shrink-0 rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition',
              totalPunkte >= reward.cost
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            ]"
          >
            {{ totalPunkte >= reward.cost ? 'Einlösen' : 'Gesperrt' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Präferenzen -->
    <div class="mt-6">
      <h2 class="text-[15px] font-semibold text-slate-900 mb-3">Präferenzen</h2>
      <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.239-4.5-5-4.5-1.74 0-3.27.81-4 2.03-.73-1.22-2.26-2.03-4-2.03-2.761 0-5 2.015-5 4.5 0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <span class="flex-1 text-[14px] text-slate-700">Interessengebiete</span>
          <span class="text-[13px] text-indigo-500">Sport, Kultur +2</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="flex-1 text-[14px] text-slate-700">Verfügbare Zeiten</span>
          <span class="text-[13px] text-indigo-500">Wochenende</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-slate-50">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span class="flex-1 text-[14px] text-slate-700">Standort</span>
          <span class="text-[13px] text-indigo-500">Vorarlberg</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5">
          <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span class="flex-1 text-[14px] text-slate-700">Benachrichtigungen</span>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="notifications ? 'bg-blue-600' : 'bg-slate-200'"
            @click="notifications = !notifications"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              :class="notifications ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <div class="mt-6 mb-4">
      <button
        class="w-full rounded-2xl bg-white shadow-sm px-4 py-3.5 flex items-center gap-3 text-red-500 hover:bg-red-50 transition"
        @click="handleLogout"
      >
        <svg viewBox="0 0 24 24" class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
        </svg>
        <span class="text-[14px] font-medium">Abmelden</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { getAuthHeader, getUserInfo, logout } from '~/assets/utils/auth.js'

definePageMeta({ layout: 'user', middleware: 'auth' })

const config = useRuntimeConfig()
const pending = ref(true)
const participations = ref([])
const notifications = ref(true)

const userInfo = getUserInfo()
const userName = computed(() => userInfo?.name ?? userInfo?.unique_name ?? userInfo?.email ?? 'Benutzer')

const completedParticipations = computed(() =>
  participations.value.filter(p => p.status === 'Completed')
)

const totalEinsaetze = computed(() => completedParticipations.value.length)

const totalPunkte = computed(() =>
  completedParticipations.value.reduce((sum, p) => sum + (p.shift?.points ?? 0), 0)
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

onMounted(async () => {
  try {
    const res = await $fetch(`${config.public.apiBase}/Participation/user`, {
      headers: { Authorization: getAuthHeader() },
    })
    participations.value = res || []
  } catch (e) {
    console.error(e)
  } finally {
    pending.value = false
  }
})
</script>
