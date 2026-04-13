<template>
  <div class="min-h-screen bg-gray-50 flex">
    <OrganizationMenu />

    <main class="flex-1 ml-64 p-8">
      <header class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Veranstaltungen</h1>
          <p class="text-gray-600">Verwalten Sie Ihre Events und die zugehörigen Dienste</p>
        </div>
        <button @click="showForm = !showForm"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md">
          {{ showForm ? 'Abbrechen' : 'Neue Veranstaltung' }}
        </button>
      </header>

      <transition name="fade">
        <div v-if="showForm" class="bg-white p-6 rounded-xl border mb-8 shadow-sm border-gray-200">
          <h2 class="text-lg font-bold mb-4 text-gray-800">Neue Veranstaltung erstellen</h2>
          <form @submit.prevent="saveEvent" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Titel</label>
              <input v-model="newEvent.title" placeholder="Sommerfest 2026" class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ort</label>
              <input v-model="newEvent.location" placeholder="Marktplatz" class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Startdatum & Zeit</label>
              <input v-model="newEvent.startDate" type="datetime-local" :min="minDateTime" class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Enddatum & Zeit</label>
              <input v-model="newEvent.endDate" type="datetime-local" :min="newEvent.startDate || minDateTime" class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <button type="submit" :disabled="isSubmitting"
                    class="md:col-span-2 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors disabled:bg-gray-400">
              {{ isSubmitting ? 'Wird gespeichert...' : 'Veranstaltung speichern' }}
            </button>
          </form>
        </div>
      </transition>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="isLoading" class="p-12 text-center text-gray-500 animate-pulse">
          Lade Veranstaltungen...
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Event</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ort</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Datum</th>
              <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aktion</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900">{{ event.title }}</td>
              <td class="px-6 py-4 text-gray-600">{{ event.location }}</td>
              <td class="px-6 py-4 text-gray-600 text-sm">
                {{ new Date(event.startDate).toLocaleDateString('de-DE') }}
              </td>
              <td class="px-6 py-4 text-center">
                <button @click="deleteEvent(event.id)" class="text-red-500 hover:text-red-700 text-sm font-bold">Löschen</button>
              </td>
            </tr>
            <tr v-if="events.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-gray-400">Keine Veranstaltungen gefunden.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
// Nutze deine Utils
import { getAuthHeader, logout, authenticatedFetch, getUserInfo } from '../../assets/utils/auth';

const config = useRuntimeConfig();
const events = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showForm = ref(false);

const newEvent = ref({
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '' // Falls dein Backend das braucht
});

// Heutiges Datum für den Datepicker-Min-Wert
const minDateTime = computed(() => {
  return new Date().toISOString().slice(0, 16);
});

// Daten laden
const loadEvents = async () => {
  if (!process.client) return;
  isLoading.value = true;
  try {
    const data = await $fetch(`${config.public.apiBase}/events`, {
      headers: { Authorization: getAuthHeader() }
    });
    events.value = data;
  } catch (error) {
    console.error("Fehler beim Laden:", error);
    if (error.status === 401) logout();
  } finally {
    isLoading.value = false;
  }
};

const saveEvent = async () => {
  const user = getUserInfo();
  console.log(user);
  if (!user?.OrganizationId) {
    alert("Fehler: Organisations-ID konnte nicht gefunden werden.");
    return;
  }

  isSubmitting.value = true;
  try {
    // Hier fügen wir die OrganizationId zum Payload hinzu
    const payload = {
      ...newEvent.value,
      organizationId: parseInt(user.OrganizationId)
    };

    await authenticatedFetch(`${config.public.apiBase}/events`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    showForm.value = false;
    newEvent.value = { title: '', location: '', startDate: '', endDate: '', description: '' };
    await loadEvents(); // Liste neu laden
  } catch (error) {
    alert("Fehler beim Speichern der Veranstaltung.");
  } finally {
    isSubmitting.value = false;
  }
};

const deleteEvent = async (id) => {
  if (!confirm("Möchten Sie dieses Event wirklich löschen?")) return;
  try {
    await authenticatedFetch(`${config.public.apiBase}/events/${id}`, {
      method: 'DELETE'
    });
    await loadEvents();
  } catch (error) {
    alert("Löschen fehlgeschlagen.");
  }
};

onMounted(() => {
  loadEvents();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>