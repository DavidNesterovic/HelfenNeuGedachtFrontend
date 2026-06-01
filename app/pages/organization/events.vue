<template>
    <div class="min-h-screen bg-gray-50 flex">
        <OrganizationMenu />

        <main class="flex-1 p-8">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Veranstaltungen</h1>
                    <p class="text-gray-600">Verwalten Sie Ihre Events und die zugehörigen Dienste</p>
                </div>
                <button @click="showForm = !showForm"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2">
                    <svg v-if="!showForm" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    {{ showForm ? 'Abbrechen' : 'NEUE VERANSTALTUNG ERSTELLEN' }}
                </button>
            </header>

            <transition name="fade">
                <div v-if="showForm" class="bg-white p-6 rounded-xl border mb-8 shadow-sm border-gray-200">
                    <h2 class="text-lg font-bold mb-4 text-gray-800">Neue Veranstaltung erstellen</h2>
                    <form @submit.prevent="saveEvent" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col md:col-span-2">
                            <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Titel</label>
                            <input v-model="newEvent.title" placeholder="Sommerfest"
                                class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div class="flex flex-col md:col-span-2">
                            <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Beschreibung</label>
                            <textarea v-model="newEvent.description" rows="3"
                                class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                required></textarea>
                        </div>
                        <div class="flex flex-col">
                            <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ort</label>
                            <input v-model="newEvent.location" placeholder="Marktplatz"
                                class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Start</label>
                                <input v-model="newEvent.startDate" type="datetime-local" :min="minDateTime"
                                    class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ende</label>
                                <input v-model="newEvent.endDate" type="datetime-local"
                                    :min="newEvent.startDate || minDateTime"
                                    class="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required />
                            </div>
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
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Veranstaltung</th>
                            <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ort</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Datum</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Helfer</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aktion</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-100 text-sm">
                        <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-bold text-gray-900">{{ event.title }}</td>
                            <td class="px-6 py-4 text-gray-600">{{ event.location }}</td>
                            <td class="px-6 py-4 text-center text-gray-600">
                                {{ formatDate(event.startDate) }}
                            </td>
                            <td class="px-6 py-4 text-center font-semibold text-blue-600">
                                {{ event.promisedHelpers + "/" + event.requiredHelpers }}
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span :class="getStatusBadgeClass(event.eventStatus)" class="px-2.5 py-1 rounded-full text-xs font-semibold border">
                                    {{ getStatusLabel(event.eventStatus) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex justify-center gap-4 font-bold uppercase text-xs">
                                    <button @click="openDetails(event)"
                                        class="text-blue-600 hover:text-blue-800">Details</button>
                                    <button @click="deleteEvent(event.id)"
                                        class="text-red-500 hover:text-red-700">Löschen</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="events.length === 0">
                            <td colspan="6" class="px-6 py-10 text-center text-gray-400 font-medium">Keine
                                Veranstaltungen gefunden.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <div v-if="selectedEvent"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 border-b bg-gray-50">
                    <div class="flex justify-between items-start mb-4">
                        <h2 class="text-2xl font-bold text-gray-900">{{ selectedEvent.title }}</h2>
                        <button @click="selectedEvent = null" class="text-gray-400 hover:text-gray-600">
                            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                        <span class="flex items-center gap-1"><svg width="18" height="18" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>{{ formatDate(selectedEvent.startDate) }}</span>
                        <span class="flex items-center gap-1"><svg width="18" height="18" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>{{ selectedEvent.location }}</span>
                    </div>
                    <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-200/50 pt-3">
                        <label class="text-xs font-bold text-gray-500 uppercase">Event-Status:</label>
                        <select 
                            v-model="selectedEvent.eventStatus" 
                            @change="updateEventStatus"
                            :disabled="isUpdatingStatus"
                            class="border rounded-lg px-2.5 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60 font-semibold"
                        >
                            <option :value="0">Geplant</option>
                            <option :value="1">Findet statt</option>
                            <option :value="2">Durchgeführt</option>
                            <option :value="3">Abgesagt</option>
                        </select>
                        <span v-if="isUpdatingStatus" class="text-xs text-blue-600 animate-pulse font-medium">Wird aktualisiert...</span>
                    </div>
                </div>

                <div class="p-6 overflow-y-auto flex-1">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Dienste</h3>
                        <button @click="showShiftForm = true" v-if="!showShiftForm"
                            class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700">
                            DIENST HINZUFÜGEN
                        </button>
                    </div>

                    <div v-if="showShiftForm" class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
                        <input v-model="shiftForm.name" placeholder="Name (z.B. Bar-Dienst)"
                            class="w-full border p-2 rounded shadow-sm outline-none" />
                        <textarea v-model="shiftForm.description" placeholder="Beschreibung"
                            class="w-full border p-2 rounded shadow-sm outline-none"></textarea>
                        <div class="grid grid-cols-2 gap-2">
                            <label for="helpers">Anzahl Helfer</label>
                            <input v-model.number="shiftForm.requiredHelpers" type="number" name="helpers"
                                placeholder="Helfer Anzahl" class="border p-2 rounded shadow-sm outline-none" />
                            <label for="points">Punkte</label>
                            <input v-model.number="shiftForm.points" type="number" name="points" placeholder="Punkte"
                                class="border p-2 rounded shadow-sm outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Kategorien</label>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    v-for="cat in availableCategories"
                                    :key="cat.id"
                                    type="button"
                                    @click="toggleShiftCategory(cat.id)"
                                    :class="[
                                        'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                                        shiftForm.categoryIds.includes(cat.id)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                    ]"
                                >{{ cat.name }}</button>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="saveShift" class="flex-1 bg-green-600 text-white py-2 rounded font-bold">{{
                                shiftForm.id ? 'Aktualisieren' : 'Dienst speichern' }}</button>
                            <button @click="resetShiftForm"
                                class="flex-1 bg-gray-200 text-gray-600 py-2 rounded font-bold text-sm">Abbrechen</button>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div v-for="shift in currentShifts" :key="shift.id"
                            class="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 class="font-bold text-gray-900">{{ shift.name }}</h4>
                                <p class="text-xs text-gray-500">{{ shift.points }} Punkte | {{ getConfirmedHelpers(shift).length }}/{{ shift.requiredHelpers }} Helfer</p>
                                <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                                    <span v-for="cat in shift.categories" :key="cat.id"
                                        class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">
                                        {{ cat.name }}
                                    </span>
                                </div>
                                <div class="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                                    <h5 class="text-xs font-black uppercase text-gray-400 px-3 pt-3 pb-2">Helfer:innen</h5>

                                    <template v-if="getInterestedHelpers(shift).length > 0">
                                        <div class="px-3 pb-1.5">
                                            <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                                                Interessiert ({{ getInterestedHelpers(shift).length }})
                                            </span>
                                        </div>
                                        <div v-for="helper in getInterestedHelpers(shift)" :key="'int-' + helper.userId"
                                            class="flex items-center justify-between px-3 py-1.5 border-t border-gray-100">
                                            <div class="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                                                <div class="w-2 h-2 bg-amber-400 rounded-full shrink-0"></div>
                                                <span class="truncate">{{ helper.userName }}</span>
                                            </div>
                                            <div class="flex gap-1 shrink-0 ml-2">
                                                <button @click="confirmHelper(helper)"
                                                    :disabled="helper._updating"
                                                    class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-semibold hover:bg-green-200 transition-colors disabled:opacity-50">
                                                    Bestätigen
                                                </button>
                                                <button @click="rejectHelper(helper)"
                                                    :disabled="helper._updating"
                                                    class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                                                    Ablehnen
                                                </button>
                                            </div>
                                        </div>
                                    </template>

                                    <template v-if="getConfirmedHelpers(shift).length > 0">
                                        <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 }">
                                            <span class="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                                                Bestätigt ({{ getConfirmedHelpers(shift).length }})
                                            </span>
                                        </div>
                                        <div v-for="helper in getConfirmedHelpers(shift)" :key="'conf-' + helper.userId"
                                            class="flex items-center px-3 py-1.5 border-t border-gray-100 gap-2 text-sm text-gray-700">
                                            <div class="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                                            <span class="truncate">{{ helper.userName }}</span>
                                        </div>
                                    </template>

                                    <div v-if="getInterestedHelpers(shift).length === 0 && getConfirmedHelpers(shift).length === 0"
                                        class="px-3 pb-3 text-xs text-gray-400 italic">
                                        Noch keine Helfer:innen eingetragen
                                    </div>
                                    <div class="pb-1"></div>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button @click="editShift(shift)"
                                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button @click="deleteShift(shift.id)"
                                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div v-if="currentShifts.length === 0" class="text-center py-8 text-gray-400 italic text-sm">
                            Noch keine Dienste für dieses Event erstellt.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getAuthHeader, logout, authenticatedFetch, getUserInfo } from '../../assets/utils/auth';

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig();
const events = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const showForm = ref(false);
const selectedEvent = ref(null);
const currentShifts = ref([]);
const availableCategories = ref([]);

// Form-States
const newEvent = ref({ title: '', location: '', startDate: '', endDate: '', description: '' });
const showShiftForm = ref(false);
const shiftForm = ref({ id: null, name: '', description: '', points: 10, requiredHelpers: 1, requirements: '', ageRestriction: 0, categoryIds: [] });

const toggleShiftCategory = (id) => {
    const idx = shiftForm.value.categoryIds.indexOf(id);
    if (idx === -1) shiftForm.value.categoryIds.push(id);
    else shiftForm.value.categoryIds.splice(idx, 1);
};

const minDateTime = computed(() => new Date().toISOString().slice(0, 16));

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const normalizeStatus = (statusVal) => {
    if (statusVal === undefined || statusVal === null) return 0;
    if (typeof statusVal === 'number') return statusVal;
    
    const parsed = parseInt(statusVal);
    if (!isNaN(parsed)) return parsed;
    
    const statusMap = {
        'Planned': 0,
        'TakePlace': 1,
        'Accomplished': 2,
        'Canceled': 3
    };
    return statusMap[statusVal] !== undefined ? statusMap[statusVal] : 0;
};

const isUpdatingStatus = ref(false);

const getStatusLabel = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
        case 0: return 'Geplant';
        case 1: return 'Findet statt';
        case 2: return 'Durchgeführt';
        case 3: return 'Abgesagt';
        default: return 'Geplant';
    }
};

const getStatusBadgeClass = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
        case 0: // Planned
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 1: // TakePlace
            return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 2: // Accomplished
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 3: // Canceled
            return 'bg-red-50 text-red-700 border-red-200';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

const updateEventStatus = async () => {
    if (!selectedEvent.value) return;
    isUpdatingStatus.value = true;
    try {
        const user = getUserInfo();
        const orgId = selectedEvent.value.organizationId || parseInt(user?.OrganizationId ?? "0");
        const rawStatus = selectedEvent.value.eventStatus !== undefined ? selectedEvent.value.eventStatus : selectedEvent.value.status;
        const normalizedStatusVal = normalizeStatus(rawStatus);

        const payload = {
            id: selectedEvent.value.id,
            title: selectedEvent.value.title || "Unbenannt",
            description: selectedEvent.value.description || "Keine Beschreibung vorhanden.",
            location: selectedEvent.value.location || "Keine Angabe",
            startDate: selectedEvent.value.startDate,
            endDate: selectedEvent.value.endDate || selectedEvent.value.startDate,
            organizationId: orgId,
            eventStatus: normalizedStatusVal
        };
        
        const response = await authenticatedFetch(`${config.public.apiBase}/events/${selectedEvent.value.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        
        if (response && !response.ok) {
            const errText = await response.text().catch(() => "");
            console.error("API error status:", response.status, errText);
            alert(`Fehler beim Aktualisieren des Event-Status: Server meldet Status ${response.status}.`);
        } else {
            await loadEvents();
        }
    } catch (error) {
        alert("Fehler beim Aktualisieren des Event-Status.");
        console.error(error);
    } finally {
        isUpdatingStatus.value = false;
    }
};

// API: Veranstaltungen laden
const loadEvents = async () => {
    if (!process.client) return;
    isLoading.value = true;
    try {
        const userInfo = getUserInfo();
        const data = await $fetch(`${config.public.apiBase}/events/organization/${userInfo.OrganizationId}`, {
            headers: { Authorization: getAuthHeader() }
        });
        events.value = data;

        for (const event of events.value) {
            console.log(event);
            event.eventStatus = normalizeStatus(event.eventStatus !== undefined ? event.eventStatus : event.eventStatus);
            const shifts = await $fetch(`${config.public.apiBase}/shifts?eventId=${event.id}`, {
                headers: { Authorization: getAuthHeader() }
            });

            let requiredHelpers = 0;
            let promisedHelpers = 0;

            for (const shift of shifts) {
                requiredHelpers += shift.requiredHelpers;

                const helpers = await $fetch(`${config.public.apiBase}/participation/shift/${shift.id}`, {
                    headers: { Authorization: getAuthHeader() }
                });

                promisedHelpers += helpers.filter(h => h.status === 1).length;
                shift.helperList = helpers;
            }

            event.shifts = shifts;
            event.requiredHelpers = requiredHelpers;
            event.promisedHelpers = promisedHelpers;
        }

        console.log(events);

        if (selectedEvent.value) {
            selectedEvent.value = events.value.find(e => e.id === selectedEvent.value.id);
        }
    } catch (error) {
        if (error.status === 401) logout();
    } finally {
        isLoading.value = false;
    }
};

const saveEvent = async () => {
    const user = getUserInfo();
    isSubmitting.value = true;
    try {
        const payload = { 
            ...newEvent.value, 
            organizationId: parseInt(user.OrganizationId),
            status: 0 // Default to Planned
        };
        await authenticatedFetch(`${config.public.apiBase}/events`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        showForm.value = false;
        newEvent.value = { title: '', location: '', startDate: '', endDate: '', description: '' };
        await loadEvents();
    } catch (error) {
        alert("Fehler beim Speichern.");
    } finally {
        isSubmitting.value = false;
    }
};

const deleteEvent = async (id) => {
    if (!confirm("Veranstaltung wirklich löschen?")) return;
    try {
        await authenticatedFetch(`${config.public.apiBase}/events/${id}`, { method: 'DELETE' });
        await loadEvents();
    } catch (error) {
        alert("Fehler beim Löschen.");
    }
};

// Dienst Logik
const openDetails = async (event) => {
    selectedEvent.value = { 
        ...event,
        status: normalizeStatus(event.status !== undefined ? event.status : event.Status)
    };
    currentShifts.value = [];
    resetShiftForm();

    try {
        const data = await $fetch(`${config.public.apiBase}/events/${event.id}`, {
            params: { includeShifts: true },
            headers: { Authorization: getAuthHeader() }
        });

        const shiftsWithHelpers = data.shifts || data.Shifts || [];

        for (const shift of shiftsWithHelpers) {
            try {
                const helpers = await $fetch(`${config.public.apiBase}/participation/shift/${shift.id}`, {
                    headers: { Authorization: getAuthHeader() }
                });
                shift.helperList = helpers;
            } catch (helperErr) {
                console.error(`Fehler beim Laden der Helfer für Dienst ${shift.id}:`, helperErr);
                shift.helperList = [];
            }
        }

        selectedEvent.value = {
            ...data,
            status: normalizeStatus(data.status !== undefined ? data.status : data.Status)
        };
        currentShifts.value = shiftsWithHelpers;

    } catch (error) {
        console.error("Fehler beim Laden der Event-Details:", error);
    }
};

const resetShiftForm = () => {
    showShiftForm.value = false;
    shiftForm.value = { id: null, name: '', description: '', points: 10, requiredHelpers: 1, requirements: '', ageRestriction: 0, categoryIds: [] };
};

const editShift = (shift) => {
    shiftForm.value = {
        ...shift,
        categoryIds: (shift.categories ?? []).map(c => c.id),
    };
    showShiftForm.value = true;
};

const saveShift = async () => {
    if (!shiftForm.value.name) return alert("Name fehlt");
    try {
        const isEdit = !!shiftForm.value.id;
        const url = isEdit ? `${config.public.apiBase}/shifts/${shiftForm.value.id}` : `${config.public.apiBase}/shifts`;
        const payload = { ...shiftForm.value, eventId: selectedEvent.value.id };

        await authenticatedFetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });

        resetShiftForm();

        const updatedEvent = await $fetch(`${config.public.apiBase}/events/${selectedEvent.value.id}`, {
            params: { includeShifts: true },
            headers: { Authorization: getAuthHeader() }
        });

        selectedEvent.value = { ...updatedEvent };
        currentShifts.value = [...(updatedEvent.shifts || updatedEvent.Shifts || [])];

        loadEvents();
    } catch (error) {
        alert("Fehler beim Speichern des Dienstes.");
    }
};

const deleteShift = async (shiftId) => {
    if (!confirm("Dienst löschen?")) return;
    try {
        await authenticatedFetch(`${config.public.apiBase}/shifts/${shiftId}`, { method: 'DELETE' });
        await loadEvents();
    } catch (error) {
        alert("Fehler beim Löschen des Dienstes.");
    }
};

const getInterestedHelpers = (shift) => (shift.helperList || []).filter(h => h.status === 0)
const getConfirmedHelpers = (shift) => (shift.helperList || []).filter(h => h.status === 1)

const updateHelperStatus = async (helper, status) => {
    helper._updating = true
    try {
        const response = await authenticatedFetch(
            `${config.public.apiBase}/Participation/status?userId=${helper.userId}&shiftId=${helper.shiftId}&status=${status}`,
            { method: 'PUT' }
        )
        if (response && response.ok) {
            const previousStatus = helper.status
            helper.status = status
            // Keep the table-level confirmed count in sync
            if (selectedEvent.value) {
                if (status === 1 && previousStatus !== 1) {
                    selectedEvent.value.promisedHelpers = (selectedEvent.value.promisedHelpers || 0) + 1
                } else if (status !== 1 && previousStatus === 1) {
                    selectedEvent.value.promisedHelpers = Math.max(0, (selectedEvent.value.promisedHelpers || 0) - 1)
                }
                const row = events.value.find(e => e.id === selectedEvent.value.id)
                if (row) row.promisedHelpers = selectedEvent.value.promisedHelpers
            }
        } else {
            alert('Fehler beim Aktualisieren des Status.')
        }
    } catch (error) {
        alert('Fehler beim Aktualisieren des Status.')
        console.error(error)
    } finally {
        helper._updating = false
    }
}

const confirmHelper = (helper) => updateHelperStatus(helper, 1)
const rejectHelper = (helper) => updateHelperStatus(helper, 3)

const loadCategories = async () => {
    try {
        availableCategories.value = await $fetch(`${config.public.apiBase}/categories`);
    } catch (e) {
        console.error('Fehler beim Laden der Kategorien:', e);
    }
};

onMounted(() => {
    loadEvents();
    loadCategories();
});
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