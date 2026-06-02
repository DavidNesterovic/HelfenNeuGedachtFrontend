<template>
  <div class="min-h-screen bg-gray-50 flex">
    <OrganizationMenu />

    <main class="flex-1 p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Willkommen!</h1>
        <p class="text-gray-600">Hier ist Ihre aktuelle Übersicht über den Helfer-Bedarf</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div class="p-4 bg-blue-100 text-blue-600 rounded-lg">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider">Aktive Veranstaltungen</p>
            <p class="text-3xl font-black text-gray-900">{{ eventsCount }}</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
          <div class="p-4 bg-green-100 text-green-600 rounded-lg">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold text-gray-500 uppercase tracking-wider">Offene Dienste</p>
            <p class="text-3xl font-black text-gray-900">{{ shiftsCount }}</p>
          </div>
        </div>

        <!-- Offene Bestätigungen Kachel -->
        <div 
          class="p-6 rounded-xl shadow-sm border flex items-center gap-4 transition-transform hover:scale-[1.02]"
          :class="pendingParticipations.length > 0 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-white border-gray-100'"
        >
          <div class="p-4 rounded-lg" :class="pendingParticipations.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-bold uppercase tracking-wider" :class="pendingParticipations.length > 0 ? 'text-orange-600' : 'text-gray-500'">Offene Bestätigungen</p>
            <div class="flex items-center gap-2">
              <p class="text-3xl font-black" :class="pendingParticipations.length > 0 ? 'text-orange-700' : 'text-gray-900'">{{ pendingParticipations.length }}</p>
              <span v-if="pendingParticipations.length > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white animate-pulse">
                Aktion nötig
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Offene Bestätigungen Sektion -->
      <div v-if="pendingParticipations.length > 0" class="bg-white p-6 rounded-xl shadow-sm border border-orange-200 mb-8">
        <div class="flex items-center gap-3 mb-5">
          <div class="p-2 bg-orange-100 rounded-lg">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800">Offene Bestätigungen</h3>
          <span class="text-sm font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            {{ pendingParticipations.length }} wartend
          </span>
        </div>

        <div class="space-y-3">
          <div 
            v-for="p in pendingParticipations" 
            :key="`${p.userId}-${p.shiftId}`"
            class="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 bg-gray-50 hover:bg-orange-50/30 transition-all group"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <!-- User Avatar Placeholder -->
              <div @click="fetchAndShowUserDetails(p.userId)" class="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center rounded-full shrink-0 font-bold text-sm cursor-pointer hover:bg-orange-200 transition-colors" title="Profil anzeigen">
                {{ getInitials(p.userName) }}
              </div>
              <div class="min-w-0">
                <div @click="fetchAndShowUserDetails(p.userId)" class="font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ p.userName }}</div>
                <div class="text-sm text-gray-500 truncate">
                  <span class="font-medium text-gray-700">{{ p.shiftName }}</span>
                  <span class="mx-1.5 text-gray-300">·</span>
                  <span>{{ p.eventTitle }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <button 
                @click="confirmParticipation(p)"
                :disabled="p._updating"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-lg transition-all
                  bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="p._updating && p._action === 'confirm'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Bestätigen
              </button>
              <button 
                @click="rejectParticipation(p)"
                :disabled="p._updating"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-lg transition-all
                  bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="p._updating && p._action === 'reject'" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Ablehnen
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Alles erledigt State (wenn keine offenen Bestätigungen und nicht am Laden) -->
      <div v-else-if="!isLoading" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">Keine offenen Bestätigungen</h3>
            <p class="text-sm text-gray-500">Alle Helfer-Anfragen wurden bearbeitet.</p>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="toast.show" class="fixed bottom-6 right-6 z-50 max-w-sm w-full">
          <div
            :class="[
              'flex items-start gap-3 p-4 rounded-xl shadow-lg border',
              toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : toast.type === 'info' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'
            ]"
          >
            <svg v-if="toast.type === 'success'" class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="toast.type === 'info'" class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>
        </div>
      </Transition>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="text-xl font-bold mb-4 text-gray-800">Meine Nächsten Veranstaltungen</h3>
        
        <div v-if="isLoading" class="animate-pulse space-y-3">
          <div class="h-12 bg-gray-100 rounded"></div>
          <div class="h-12 bg-gray-100 rounded"></div>
        </div>

        <ul v-else class="divide-y divide-gray-100">
          <li v-for="event in upcomingEvents" :key="event.id" class="py-4 flex justify-between items-center group">
            <div>
              <div class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ event.title }}</div>
              <div class="text-sm text-gray-500">
                {{ event.startDate ? new Date(event.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Kein Datum' }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="pushEvent(event)"
                :disabled="pushingEventId === event.id || pushingInterestedEventId === event.id"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg transition-all
                  bg-orange-100 text-orange-700 hover:bg-orange-200 hover:shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed"
                title="E-Mail an alle registrierten Helfer senden"
              >
                <svg v-if="pushingEventId === event.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                {{ pushingEventId === event.id ? 'Wird gesendet…' : 'Alle benachrichtigen' }}
              </button>
              <button
                @click="pushEventInterested(event)"
                :disabled="pushingInterestedEventId === event.id || pushingEventId === event.id"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-lg transition-all
                  bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed"
                title="E-Mail nur an interessierte/bestätigte Helfer senden"
              >
                <svg v-if="pushingInterestedEventId === event.id" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {{ pushingInterestedEventId === event.id ? 'Wird gesendet…' : 'Nur Interessierte' }}
              </button>
              <NuxtLink :to="`/organization/events?id=${event.id}`" class="text-blue-600 text-sm font-bold hover:underline">
                Details
              </NuxtLink>
            </div>
          </li>
          <li v-if="upcomingEvents.length === 0" class="py-4 text-gray-400 italic text-center">
            Keine Veranstaltungen gefunden.
          </li>
        </ul>
      </div>
    </main>

    <!-- User Details Popup -->
    <transition name="fade">
      <div v-if="showUserPopup"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeUserPopup">
        <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col transform transition-all duration-300 scale-100">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wider">Benutzerprofil</h3>
            <button @click="closeUserPopup" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 flex flex-col items-center">
            <!-- Loading State -->
            <div v-if="loadingUserDetail" class="flex flex-col items-center py-8 space-y-3">
              <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-sm text-gray-500 font-semibold">Lade Benutzerdaten...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="userDetailError" class="text-center py-6 text-red-500 font-semibold space-y-2">
              <svg class="w-12 h-12 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="text-sm">{{ userDetailError }}</p>
              <button @click="closeUserPopup" class="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition">Schließen</button>
            </div>

            <!-- Data Display -->
            <div v-else-if="selectedUserDetail" class="w-full space-y-6">
              <!-- User Avatar Info -->
              <div class="flex flex-col items-center pb-4 border-b border-gray-100">
                <div class="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-black text-2xl flex items-center justify-center mb-3 shadow-inner">
                  {{ selectedUserDetail.userName ? selectedUserDetail.userName.substring(0, 2).toUpperCase() : 'U' }}
                </div>
                <h4 class="text-lg font-bold text-gray-900">{{ selectedUserDetail.userName }}</h4>
                <a :href="'mailto:' + selectedUserDetail.email" class="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ selectedUserDetail.email }}
                </a>
              </div>

              <!-- User Stats / Info Grid -->
              <div class="grid grid-cols-2 gap-3 text-center">
                <div class="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Punkte</span>
                  <span class="text-lg font-black text-amber-500 mt-1 block flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {{ selectedUserDetail.points }}
                  </span>
                </div>
                <div class="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <span class="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">Einsätze</span>
                  <span class="text-lg font-black text-gray-800 mt-1 block">{{ selectedUserDetail.totalParticipations }}</span>
                </div>
              </div>
              
              <!-- Actions -->
              <button @click="closeUserPopup" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition text-sm shadow-sm">
                Schließen
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
// Nutze deine Utils (Pfade anpassen falls nötig)
import { getAuthHeader, getToken, getUserInfo } from '../../assets/utils/auth';

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig();
const eventsCount = ref(0);
const shiftsCount = ref(0);
const upcomingEvents = ref([]);
const pendingParticipations = ref([]);
const isLoading = ref(true);

const showUserPopup = ref(false);
const loadingUserDetail = ref(false);
const userDetailError = ref(null);
const selectedUserDetail = ref(null);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fetchAndShowUserDetails = async (userId) => {
  if (!userId) return;
  showUserPopup.value = true;
  loadingUserDetail.value = true;
  userDetailError.value = null;
  selectedUserDetail.value = null;
  
  try {
    const data = await $fetch(`${config.public.apiBase}/user/${userId}`, {
      headers: { Authorization: getAuthHeader() }
    });
    selectedUserDetail.value = data;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzerdetails:", error);
    userDetailError.value = "Benutzerdetails konnten nicht geladen werden.";
  } finally {
    loadingUserDetail.value = false;
  }
};

const closeUserPopup = () => {
  showUserPopup.value = false;
  selectedUserDetail.value = null;
  userDetailError.value = null;
};

// Event-Promotion (Push E-Mail)
const pushingEventId = ref(null);
const pushingInterestedEventId = ref(null);
const toast = reactive({ show: false, message: '', type: 'success' });
let toastTimer = null;

const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.show = true;
  toast.message = message;
  toast.type = type;
  toastTimer = setTimeout(() => { toast.show = false; }, 5000);
};

// Initialen aus dem Namen generieren
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Offene Bestätigung bestätigen (Status 1 = Confirmed)
const confirmParticipation = async (participation) => {
  participation._updating = true;
  participation._action = 'confirm';
  try {
    await $fetch(
      `${config.public.apiBase}/Participation/status?userId=${participation.userId}&shiftId=${participation.shiftId}&status=1`,
      {
        method: 'PUT',
        headers: { Authorization: getAuthHeader() }
      }
    );
    // Aus der Liste entfernen
    pendingParticipations.value = pendingParticipations.value.filter(
      p => !(p.userId === participation.userId && p.shiftId === participation.shiftId)
    );
    showToast(`${participation.userName} wurde für „${participation.shiftName}" bestätigt.`, 'success');
  } catch (error) {
    console.error('Fehler beim Bestätigen:', error);
    showToast('Fehler beim Bestätigen. Bitte versuchen Sie es erneut.', 'error');
  } finally {
    participation._updating = false;
    participation._action = null;
  }
};

// Offene Bestätigung ablehnen (Status 3 = Rejected)
const rejectParticipation = async (participation) => {
  participation._updating = true;
  participation._action = 'reject';
  try {
    await $fetch(
      `${config.public.apiBase}/Participation/status?userId=${participation.userId}&shiftId=${participation.shiftId}&status=3`,
      {
        method: 'PUT',
        headers: { Authorization: getAuthHeader() }
      }
    );
    // Aus der Liste entfernen
    pendingParticipations.value = pendingParticipations.value.filter(
      p => !(p.userId === participation.userId && p.shiftId === participation.shiftId)
    );
    showToast(`${participation.userName} wurde für „${participation.shiftName}" abgelehnt.`, 'info');
  } catch (error) {
    console.error('Fehler beim Ablehnen:', error);
    showToast('Fehler beim Ablehnen. Bitte versuchen Sie es erneut.', 'error');
  } finally {
    participation._updating = false;
    participation._action = null;
  }
};

const pushEvent = async (event) => {
  const confirmed = confirm(
    `Möchten Sie die Veranstaltung „${event.title}" wirklich an alle Helfer per E-Mail bewerben?\n\nDies sendet eine E-Mail an alle registrierten Nutzer.`
  );
  if (!confirmed) return;

  pushingEventId.value = event.id;

  try {
    const headers = {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json'
    };

    const eventLink = `${window.location.origin}/events`;

    const result = await $fetch(`${config.public.apiBase}/email/push-event/${event.id}`, {
      method: 'POST',
      headers,
      body: { eventLink }
    });

    showToast(
      `E-Mail erfolgreich an ${result.successCount}/${result.totalRecipients} Helfer gesendet!`,
      'success'
    );
  } catch (error) {
    console.error('Fehler beim Bewerben der Veranstaltung:', error);
    showToast(
      'Beim Versenden der E-Mails ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
      'error'
    );
  } finally {
    pushingEventId.value = null;
  }
};

const pushEventInterested = async (event) => {
  const confirmed = confirm(
    `Möchten Sie die Veranstaltung „${event.title}" nur an interessierte/bestätigte Helfer per E-Mail senden?\n\nDies sendet eine E-Mail nur an Nutzer, die sich bereits für einen Dienst angemeldet haben.`
  );
  if (!confirmed) return;

  pushingInterestedEventId.value = event.id;

  try {
    const headers = {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json'
    };

    const eventLink = `${window.location.origin}/events`;

    const result = await $fetch(`${config.public.apiBase}/email/push-event/${event.id}`, {
      method: 'POST',
      headers,
      body: { eventLink, onlyInterested: true }
    });

    if (result.totalRecipients === 0) {
      showToast(
        'Keine interessierten Helfer für dieses Event gefunden. Es wurden keine E-Mails versendet.',
        'info'
      );
    } else {
      showToast(
        `E-Mail erfolgreich an ${result.successCount}/${result.totalRecipients} interessierte Helfer gesendet!`,
        'success'
      );
    }
  } catch (error) {
    console.error('Fehler beim Senden an interessierte Helfer:', error);
    showToast(
      'Beim Versenden der E-Mails ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
      'error'
    );
  } finally {
    pushingInterestedEventId.value = null;
  }
};

// Variable für die SignalR Verbindung (außerhalb der Funktion, damit onUnmounted darauf zugreifen kann)
let connection = null;

const loadDashboardData = async () => {
  if (!process.client) return;

  const userInfo = getUserInfo();
  try {
    const headers = { Authorization: getAuthHeader() };
    
    const [eventsRes, shiftsRes, pendingRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/events/organization/${userInfo.OrganizationId}`, { headers }),
      $fetch(`${config.public.apiBase}/shifts`, { headers }),
      $fetch(`${config.public.apiBase}/participation/pending/${userInfo.OrganizationId}`, { headers })
    ]);

    eventsCount.value = eventsRes.length;
    shiftsCount.value = shiftsRes.length;
    
    // Pending Participations mit reaktiven Hilfsfeldern versehen
    pendingParticipations.value = (pendingRes || []).map(p => ({
      ...p,
      _updating: false,
      _action: null
    }));

    upcomingEvents.value = eventsRes
      .filter(e => e.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 3);

  } catch (error) {
    console.error('Fehler beim Laden der Dashboard-Daten:', error);
  } finally {
    isLoading.value = false;
  }
};

const initSignalR = async () => {
  if (!process.client) return;

  const config = useRuntimeConfig();
  const signalR = await import('@microsoft/signalr');
  
  const baseHubUrl = config.public.hubBase;

  if (!baseHubUrl || baseHubUrl.includes('undefined')) {
    console.error("KRITISCH: Hub URL ist nicht geladen!", config.public);
    return;
  }

  const rawToken = getToken();
  const cleanToken = rawToken ? rawToken.replace(/"/g, '') : '';

  try {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseHubUrl}/dashboard`, {
        accessTokenFactory: () => cleanToken,
        skipNegotiation: false, 
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection.on('dashboardUpdated', () => {
      loadDashboardData();
    });

    await connection.start();
  } catch (err) {
    console.error('SignalR Start Fehler:', err);
  }
};

onMounted(() => {
  // Reihenfolge: Erst Daten laden, dann SignalR starten
  loadDashboardData();
  initSignalR();
});

onUnmounted(() => {
  if (connection) {
    connection.stop();
  }
});
</script>
