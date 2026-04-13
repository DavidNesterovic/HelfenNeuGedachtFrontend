<template>
  <main class="p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Organisation verwalten</h1>
      <p class="text-gray-600 text-lg">Hier können Sie die Daten Ihrer Organisation einsehen und bearbeiten</p>
    </header>

    <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p class="text-gray-500">Lade Organisationsdaten...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
      <h3 class="font-bold text-lg mb-2">Fehler</h3>
      <p>{{ errorMessage }}</p>
      <button @click="loadOrganizationData" class="mt-4 text-sm font-bold underline">Erneut versuchen</button>
    </div>

    <form v-else @submit.prevent="saveChanges" class="space-y-6 max-w-5xl">
      
      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Grundlegende Informationen</h3>
        
        <div class="grid grid-cols-1 gap-6">
          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Name der Organisation *</label>
            <input v-model="orgData.name" type="text" class="border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition" required>
          </div>

          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Beschreibung</label>
            <textarea v-model="orgData.description" rows="4" class="border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col">
              <label class="text-sm font-bold text-gray-700 mb-2">Typ</label>
              <select v-model="orgData.type" class="border rounded-lg p-2.5 bg-white">
                <option value="">Bitte auswählen...</option>
                <option value="Verein">Verein</option>
                <option value="Feuerwehr">Feuerwehr</option>
                <option value="NGO">NGO</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="text-sm font-bold text-gray-700 mb-2">Registrierungsnummer *</label>
              <input v-model="orgData.registrationNumber" type="text" class="border rounded-lg p-2.5" required>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2 flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Straße und Hausnummer</label>
            <input v-model="orgData.street" type="text" class="border rounded-lg p-2.5">
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Postleitzahl</label>
            <input v-model="orgData.postalCode" type="text" class="border rounded-lg p-2.5">
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Stadt</label>
            <input v-model="orgData.city" type="text" class="border rounded-lg p-2.5">
          </div>
        </div>
      </section>

      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Kontaktinformationen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Kontakt-E-Mail *</label>
            <input v-model="orgData.contactEmail" type="email" class="border rounded-lg p-2.5" required>
          </div>
          <div class="flex flex-col">
            <label class="text-sm font-bold text-gray-700 mb-2">Kontakt-Telefon</label>
            <input v-model="orgData.contactPhone" type="tel" class="border rounded-lg p-2.5">
          </div>
        </div>
      </section>

      <div class="flex gap-4 sticky bottom-0 bg-gray-50 py-4 border-t">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition">
          Änderungen speichern
        </button>
        <button type="button" @click="loadOrganizationData" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-8 rounded-lg transition">
          Zurücksetzen
        </button>
      </div>
    </form>
  </main>
</template>

<script setup>
// Reaktive Daten für das Formular
const orgData = ref({
  name: '',
  description: '',
  type: '',
  registrationNumber: '',
  website: '',
  street: '',
  postalCode: '',
  city: '',
  state: '',
  country: '',
  contactEmail: '',
  contactPhone: '',
  contactPersonName: '',
  contactPersonRole: ''
});

const isLoading = ref(true);
const errorMessage = ref('');
const organizationId = ref(null);

// Organisation-ID aus dem Token holen (Client-side)
onMounted(async () => {
  if (process.client) {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    organizationId.value = userInfo.OrganizationId;

    if (!organizationId.value) {
      errorMessage.value = "Keine Organisations-ID gefunden.";
      isLoading.value = false;
      return;
    }
    await loadOrganizationData();
  }
});

// Daten laden
const loadOrganizationData = async () => {
  isLoading.value = true;
  try {
    const data = await $fetch(`${useRuntimeConfig().public.apiBase}/organization/${organizationId.value}`);
    orgData.value = data;
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = "Fehler beim Laden der Daten.";
  } finally {
    isLoading.value = false;
  }
};

// Daten speichern
const saveChanges = async () => {
  try {
    await $fetch(`${useRuntimeConfig().public.apiBase}/organization/${organizationId.value}`, {
      method: 'PUT',
      body: orgData.value
    });
    alert('Änderungen erfolgreich gespeichert!');
  } catch (error) {
    alert('Fehler beim Speichern der Änderungen.');
  }
};
</script>