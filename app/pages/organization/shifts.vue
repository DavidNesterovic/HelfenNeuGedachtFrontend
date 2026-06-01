<template>
    <div class="min-h-screen bg-gray-50 flex">
        <OrganizationMenu />

        <main class="flex-1 p-8">
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

            <template v-else>
                <!-- Filter & Search Section -->
                <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
                    <div class="flex-1 w-full">
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Suche</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input 
                                v-model="searchQuery" 
                                type="text" 
                                placeholder="Dienst, Veranstaltung oder Beschreibung suchen..." 
                                class="pl-10 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div class="w-full md:w-64">
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Veranstaltung filtern</label>
                        <select 
                            v-model="selectedEventFilterId" 
                            class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                        >
                            <option value="">Alle Veranstaltungen</option>
                            <option v-for="event in filteredEventsForDropdown" :key="event.id" :value="event.id">
                                {{ event.title }}
                            </option>
                        </select>
                    </div>

                    <div class="flex items-center h-[42px] px-2 shrink-0">
                        <label class="inline-flex items-center cursor-pointer select-none">
                            <div class="relative">
                                <input 
                                    v-model="showUpcomingOnly" 
                                    type="checkbox" 
                                    class="sr-only peer"
                                />
                                <div class="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span class="ml-3 text-sm font-semibold text-gray-600">Nur bevorstehende Veranstaltungen</span>
                        </label>
                    </div>

                    <button 
                        @click="resetFilters"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 h-[42px] shrink-0"
                    >
                        Zurücksetzen
                    </button>
                </div>

                <!-- Grid List -->
                <div v-if="filteredShifts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="shift in filteredShifts" :key="shift.id"
                        class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between">
                        <div>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg shrink-0">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-bold text-gray-800 truncate" :title="shift.name">{{ shift.name }}</h2>
                            </div>

                            <!-- Display Assigned Event Name -->
                            <div class="flex items-center gap-2 text-xs text-gray-500 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span class="font-medium truncate" :title="getEventName(shift.eventId)">
                                    Veranstaltung: <strong class="text-gray-700">{{ getEventName(shift.eventId) }}</strong>
                                </span>
                            </div>

                            <p class="text-gray-600 mb-3 line-clamp-2 text-sm">{{ shift.description }}</p>
                            
                            <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mb-4">
                                <span v-for="cat in shift.categories" :key="cat.id"
                                    class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold border border-blue-100">
                                    {{ cat.name }}
                                </span>
                            </div>
                        </div>
                        
                        <button @click="openEditModal(shift)"
                            class="w-full bg-gray-50 hover:bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg border border-blue-100 transition-colors mt-auto">
                            Details / Bearbeiten
                        </button>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div class="w-16 h-16 bg-gray-50 text-gray-400 flex items-center justify-center rounded-full mx-auto mb-4 border border-gray-100">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-gray-700 mb-1">Keine Dienste gefunden</h3>
                    <p class="text-gray-400 text-sm max-w-md mx-auto mb-5">
                        Es gibt keine Dienste, die Ihren Such- und Filterkriterien entsprechen. Passen Sie die Filter an oder setzen Sie diese zurück.
                    </p>
                    <button 
                        @click="resetFilters" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >
                        Filter zurücksetzen
                    </button>
                </div>
            </template>

            <div v-if="isCreateModalOpen || isEditModalOpen"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
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
                                <label class="block text-sm font-medium text-gray-700">Schwierigkeit</label>
                                <select v-model.number="shiftForm.difficulty"
                                    class="mt-1 block w-full rounded-lg border-gray-300 border p-2 bg-white">
                                    <option :value="0">Einfach (10 Pkt/h)</option>
                                    <option :value="1">Mittel (20 Pkt/h)</option>
                                    <option :value="2">Schwer (30 Pkt/h)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Alter</label>
                                <input v-model.number="shiftForm.ageRestriction" type="number"
                                    class="mt-1 block w-full rounded-lg border-gray-300 border p-2" min="0">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Schichtstart <span class="text-gray-400 font-normal">(opt.)</span></label>
                                <input v-model="shiftForm.startTime" type="datetime-local"
                                    class="mt-1 block w-full rounded-lg border-gray-300 border p-2 text-sm">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Schichtende <span class="text-gray-400 font-normal">(opt.)</span></label>
                                <input v-model="shiftForm.endTime" type="datetime-local"
                                    class="mt-1 block w-full rounded-lg border-gray-300 border p-2 text-sm">
                            </div>
                        </div>

                        <div class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 font-medium">
                            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            {{ shiftPointsPreview }} Punkte ({{ shiftDifficultyLabel(shiftForm.difficulty) }} · {{ shiftDurationLabel }})
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

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Kategorien</label>
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
import { getAuthHeader, logout, authenticatedFetch, getUserInfo } from '../../assets/utils/auth';

definePageMeta({ middleware: 'auth' })

const isLoading = ref(true);
const shifts = ref([]);
const events = ref([]);
const availableCategories = ref([]);
const config = useRuntimeConfig();

// Search & Filter State
const searchQuery = ref('');
const selectedEventFilterId = ref('');
const showUpcomingOnly = ref(true);

const getEventName = (eventId) => {
    const ev = events.value.find(e => e.id === eventId);
    return ev ? ev.title : 'Keine Veranstaltung';
};

const filteredEventsForDropdown = computed(() => {
    if (showUpcomingOnly.value) {
        return events.value.filter(e => {
            if (!e.startDate) return false;
            return new Date(e.startDate) >= new Date();
        });
    }
    return events.value;
});

const filteredShifts = computed(() => {
    return shifts.value.filter(shift => {
        const assocEvent = events.value.find(e => e.id === shift.eventId);
        const eventTitle = assocEvent ? assocEvent.title : '';
        
        // 1. Search Query filter (shift name, event name, description)
        const q = searchQuery.value.toLowerCase().trim();
        if (q) {
            const matchesName = shift.name?.toLowerCase().includes(q);
            const matchesDesc = shift.description?.toLowerCase().includes(q);
            const matchesEvent = eventTitle.toLowerCase().includes(q);
            if (!matchesName && !matchesDesc && !matchesEvent) {
                return false;
            }
        }
        
        // 2. Dropdown Event filter
        if (selectedEventFilterId.value) {
            if (shift.eventId !== Number(selectedEventFilterId.value)) {
                return false;
            }
        }
        
        // 3. Upcoming events checkbox filter
        if (showUpcomingOnly.value) {
            if (!assocEvent || !assocEvent.startDate) {
                return false;
            }
            const isUpcoming = new Date(assocEvent.startDate) >= new Date();
            if (!isUpcoming) {
                return false;
            }
        }
        
        return true;
    });
});

watch(showUpcomingOnly, (newVal) => {
    if (newVal && selectedEventFilterId.value) {
        const isSelectedEventUpcoming = filteredEventsForDropdown.value.some(e => e.id === Number(selectedEventFilterId.value));
        if (!isSelectedEventUpcoming) {
            selectedEventFilterId.value = '';
        }
    }
});

const resetFilters = () => {
    searchQuery.value = '';
    selectedEventFilterId.value = '';
    showUpcomingOnly.value = true;
};

// Modal & Form State
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isSubmitting = ref(false);

const shiftForm = ref({
    id: null,
    name: '',
    description: '',
    requirements: '',
    ageRestriction: 0,
    difficulty: 0,
    startTime: '',
    endTime: '',
    eventId: '',
    categoryIds: []
});

const toggleShiftCategory = (id) => {
    const idx = shiftForm.value.categoryIds.indexOf(id);
    if (idx === -1) shiftForm.value.categoryIds.push(id);
    else shiftForm.value.categoryIds.splice(idx, 1);
};

const shiftDifficultyLabel = (d) => ({ 0: 'Einfach', 1: 'Mittel', 2: 'Schwer' }[d] ?? 'Einfach');
const shiftRatePerHour = (d) => ({ 0: 10, 1: 20, 2: 30 }[d] ?? 10);

const selectedEventDates = computed(() => {
    const ev = events.value.find(e => e.id === shiftForm.value.eventId);
    return ev ? { start: ev.startDate, end: ev.endDate } : null;
});

const shiftDurationLabel = computed(() => {
    const startRaw = shiftForm.value.startTime || selectedEventDates.value?.start;
    const endRaw = shiftForm.value.endTime || selectedEventDates.value?.end;
    if (!startRaw || !endRaw) return '–';
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (end <= start) return '–';
    const h = (end - start) / (1000 * 60 * 60);
    return h < 1 ? `${Math.round(h * 60)} Min` : `${Math.round(h * 10) / 10} Std`;
});

const shiftPointsPreview = computed(() => {
    const rate = shiftRatePerHour(shiftForm.value.difficulty);
    const startRaw = shiftForm.value.startTime || selectedEventDates.value?.start;
    const endRaw = shiftForm.value.endTime || selectedEventDates.value?.end;
    if (!startRaw || !endRaw) return '–';
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (end <= start) return '–';
    const hours = (end - start) / (1000 * 60 * 60);
    return Math.max(1, Math.round(hours * rate));
});

const loadData = async () => {
    if (!process.client) return;

    isLoading.value = true;
    try {
        const headers = { Authorization: getAuthHeader() };
        const userInfo = getUserInfo();
        const [shiftsRes, eventsRes, categoriesRes] = await Promise.all([
            $fetch(`${config.public.apiBase}/shifts`, { headers }),
            $fetch(`${config.public.apiBase}/events/organization/${userInfo.OrganizationId}`, { headers }),
            $fetch(`${config.public.apiBase}/categories`)
        ]);

        shifts.value = shiftsRes;
        events.value = eventsRes;
        availableCategories.value = categoriesRes;
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        if (error.status === 401) logout();
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});

const toLocalDatetime = (iso) => iso ? new Date(iso).toISOString().slice(0, 16) : '';

const openCreateModal = () => {
    shiftForm.value = { id: null, name: '', description: '', requirements: '', ageRestriction: 0, difficulty: 0, startTime: '', endTime: '', eventId: '', categoryIds: [] };
    isCreateModalOpen.value = true;
};

const openEditModal = (shift) => {
    shiftForm.value = {
        ...shift,
        difficulty: shift.difficulty ?? 0,
        startTime: toLocalDatetime(shift.startTime),
        endTime: toLocalDatetime(shift.endTime),
        categoryIds: (shift.categories ?? []).map(c => c.id),
    };
    isEditModalOpen.value = true;
};

const saveShift = async (isEdit = false) => {
    isSubmitting.value = true;
    const url = isEdit
        ? `${config.public.apiBase}/shifts/${shiftForm.value.id}`
        : `${config.public.apiBase}/shifts`;

    try {
        await authenticatedFetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            body: JSON.stringify(shiftForm.value)
        });

        isCreateModalOpen.value = false;
        isEditModalOpen.value = false;

        
        await loadData();
    } catch (error) {
        alert("Fehler beim Speichern: " + error.message);
    } finally {
        isSubmitting.value = false;
    }
};

const deleteShift = async (id) => {
    if (!confirm("Diesen Dienst wirklich löschen?")) return;
    try {
        await authenticatedFetch(`${config.public.apiBase}/shifts/${id}`, {
            method: 'DELETE'
        });
        isEditModalOpen.value = false;
        
        await loadData();
    } catch (error) {
        alert("Löschen fehlgeschlagen");
    }
};

</script>