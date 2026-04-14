<template>
  <div class="min-h-screen bg-gray-50 flex">
    <OrganizationMenu />

    <main class="flex-1 ml-64 p-8">
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
            <NuxtLink :to="`/organization/events?id=${event.id}`" class="text-blue-600 text-sm font-bold hover:underline">
              Details
            </NuxtLink>
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

const config = useRuntimeConfig();
const eventsCount = ref(0);
const shiftsCount = ref(0);
const upcomingEvents = ref([]);
const isLoading = ref(true);

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