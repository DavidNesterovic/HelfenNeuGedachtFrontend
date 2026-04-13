<template>
    <div class="min-h-screen bg-gray-50 flex">
        <OrganizationMenu />

        <main class="flex-1 ml-64 p-8">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Dienste</h1>
                    <p class="text-gray-600">Verwalten Sie Ihre Dienstvorlagen</p>
                </div>
                <button @click="openCreateModal"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    NEUEN DIENST ERSTELLEN
                </button>
            </header>

            <div v-if="isLoading" class="text-center py-20 text-gray-500 animate-pulse">Lade Dienste...</div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="shift in shifts" :key="shift.id"
                    class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h2 class="text-xl font-bold text-gray-800">{{ shift.name }}</h2>
                    </div>
                    <p class="text-gray-600 mb-6 line-clamp-2 text-sm">{{ shift.description }}</p>
                    <button @click="openEditModal(shift)"
                        class="w-full bg-gray-50 hover:bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg border border-blue-100 transition-colors">
                        Details / Bearbeiten
                    </button>
                </div>
            </div>

            <div v-if="isCreateModalOpen || isEditModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                    <div class="p-6 border-b flex justify-between items-center">
                        <h2 class="text-xl font-bold">{{ isEditModalOpen ? 'Dienst bearbeiten' : 'Neuen Dienst erstellen' }}</h2>
                        <button @click="isCreateModalOpen = false; isEditModalOpen = false"
                            class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form @submit.prevent="saveShift(isEditModalOpen)" class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Bezeichnung</label>
                            <input v-model="shiftForm.name" type="text"
                                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Beschreibung</label>
                            <textarea v-model="shiftForm.description" rows="3"
                                class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                required></textarea>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Punkte</label>
                                <input v-model.number="shiftForm.points" type="number"
                                    class="mt-1 block w-full rounded-lg border-gray-300 border p-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Alter</label>
                                <input v-model.number="shiftForm.ageRestriction" type="number"
                                    class="mt-1 block w-full rounded-lg border-gray-300 border p-2">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700">Veranstaltung</label>
                            <select v-model="shiftForm.eventId"
                                class="mt-1 block w-full rounded-lg border-gray-300 border p-2" required>
                                <option value="" disabled>Bitte wählen...</option>
                                <option v-for="event in events" :key="event.id" :value="event.id">{{ event.title }}
                                </option>
                            </select>
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button type="submit"
                                class="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">Speichern</button>
                            <button v-if="isEditModalOpen" type="button" @click="deleteShift(shiftForm.id)"
                                class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100">Löschen</button>
                            <button type="button" @click="isCreateModalOpen = false; isEditModalOpen = false"
                                class="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200">Abbrechen</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
// State Management
const shifts = ref([]);
const events = ref([]);
const isLoading = ref(true);

// Modal States
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);

// Form Data
const shiftForm = ref({
    id: null,
    name: '',
    description: '',
    requirements: '',
    ageRestriction: 0,
    points: 10,
    eventId: ''
});

// Daten laden
const loadData = async () => {
    isLoading.value = true;
    try {
        const [shiftsRes, eventsRes] = await Promise.all([
            $fetch(`${useRuntimeConfig().public.apiBase}/shifts`),
            $fetch(`${useRuntimeConfig().public.apiBase}/events`)
        ]);
        shifts.value = shiftsRes;
        events.value = eventsRes;
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    } finally {
        isLoading.value = false;
    }
};

// CRUD Operationen
const openCreateModal = () => {
    shiftForm.value = { name: '', description: '', requirements: '', ageRestriction: 0, points: 10, eventId: '' };
    isCreateModalOpen.value = true;
};

const openEditModal = (shift) => {
    shiftForm.value = { ...shift };
    isEditModalOpen.value = true;
};

const saveShift = async (isEdit = false) => {
    const url = isEdit
        ? `${useRuntimeConfig().public.apiBase}/shifts/${shiftForm.value.id}`
        : `${useRuntimeConfig().public.apiBase}/shifts`;

    try {
        await $fetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            body: shiftForm.value
        });
        isCreateModalOpen.value = false;
        isEditModalOpen.value = false;
        await loadData(); // Liste aktualisieren
    } catch (error) {
        alert("Fehler beim Speichern");
    }
};

const deleteShift = async (id) => {
    if (!confirm("Diesen Dienst wirklich löschen?")) return;
    try {
        await $fetch(`${useRuntimeConfig().public.apiBase}/shifts/${id}`, { method: 'DELETE' });
        isEditModalOpen.value = false;
        await loadData();
    } catch (error) {
        alert("Löschen fehlgeschlagen");
    }
};

onMounted(loadData);
</script>