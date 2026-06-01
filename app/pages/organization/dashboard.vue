<template>
  <div class="min-h-screen bg-gray-50 flex">
    <OrganizationMenu />

    <main class="flex-1 p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Willkommen!</h1>
        <p class="text-gray-600">Hier ist Ihre aktuelle Übersicht über den Helfer-Bedarf</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
const isLoading = ref(true);

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
  console.log(userInfo.OrganizationId);
  
  try {
    const headers = { Authorization: getAuthHeader() };
    
    const [eventsRes, shiftsRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/events/organization/${userInfo.OrganizationId}`, { headers }),
      $fetch(`${config.public.apiBase}/shifts`, { headers })
    ]);

    eventsCount.value = eventsRes.length;
    shiftsCount.value = shiftsRes.length;

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
