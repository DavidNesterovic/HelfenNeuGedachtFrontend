<template>
    <div class="min-h-screen bg-gray-50 flex">
        <OrganizationMenu />

        <main class="flex-1 p-8">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Veranstaltungen</h1>
                    <p class="text-gray-600">Verwalten Sie Ihre Events und die zugehörigen Dienste</p>
                </div>
                <button @click="openCreateModal"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md flex items-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    NEUE VERANSTALTUNG ERSTELLEN
                </button>
            </header>

            <!-- Filter, Search & Sort Section -->
            <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[250px] w-full">
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
                            placeholder="Veranstaltungsname oder Ort suchen..." 
                            class="pl-10 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                        />
                    </div>
                </div>

                <div class="w-full md:w-48">
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Datum filtern</label>
                    <input 
                        v-model="selectedDateFilter" 
                        type="date" 
                        class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                <div class="w-full md:w-48">
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Status filtern</label>
                    <select 
                        v-model="selectedStatusFilter" 
                        class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 outline-none transition font-semibold"
                    >
                        <option value="">Alle</option>
                        <option value="0">Geplant</option>
                        <option value="1">Findet statt</option>
                        <option value="2">Durchgeführt</option>
                        <option value="3">Abgesagt</option>
                    </select>
                </div>

                <div class="flex items-center h-[42px] px-2 shrink-0">
                    <label class="inline-flex items-center cursor-pointer select-none">
                        <div class="relative">
                            <input 
                                v-model="showPastEvents" 
                                type="checkbox" 
                                class="sr-only peer"
                            />
                            <div class="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                        <span class="ml-3 text-sm font-semibold text-gray-600">Vergangene anzeigen</span>
                    </label>
                </div>

                <button 
                    @click="resetFilters"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 h-[42px] shrink-0"
                >
                    Zurücksetzen
                </button>
            </div>

            <!-- Loading Indicator -->
            <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 animate-pulse">
                Lade Veranstaltungen...
            </div>

            <div v-else class="space-y-8">
                <!-- Table 1: Aktive & Bevorstehende Veranstaltungen -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span class="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                            Aktive & Bevorstehende Veranstaltungen ({{ upcomingEventsList.length }})
                        </h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th 
                                        @click="toggleSort('title')" 
                                        class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div class="flex items-center gap-1.5">
                                            <span>Veranstaltung</span>
                                            <span class="text-gray-400">
                                                <svg v-if="sortBy === 'title-asc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                                <svg v-else-if="sortBy === 'title-desc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                                <svg v-else class="w-3.5 h-3.5 inline text-gray-300 hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ort</th>
                                    <th 
                                        @click="toggleSort('date')" 
                                        class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div class="flex items-center justify-center gap-1.5">
                                            <span>Datum</span>
                                            <span class="text-gray-400">
                                                <svg v-if="sortBy === 'date-asc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                                <svg v-else-if="sortBy === 'date-desc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                                <svg v-else class="w-3.5 h-3.5 inline text-gray-300 hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Helfer</th>
                                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aktion</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-100 text-sm">
                                <tr v-for="event in upcomingEventsList" :key="event.id" class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="flex items-center gap-3">
                                            <img v-if="event.imageUrl" :src="`${apiBase}${event.imageUrl}`" :alt="event.title" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                                            <div v-else class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span class="font-bold text-gray-900">{{ event.title }}</span>
                                        </div>
                                    </td>
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
                                        <div v-if="needsAttention(event)" class="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md" :title="getAttentionHint(event)">
                                            <svg class="w-3.5 h-3.5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                            </svg>
                                            <span>Status prüfen</span>
                                        </div>
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
                                <tr v-if="upcomingEventsList.length === 0">
                                    <td colspan="6" class="px-6 py-10 text-center text-gray-400 font-medium">Keine aktiven oder bevorstehenden Veranstaltungen gefunden.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Table 2: Vergangene Veranstaltungen -->
                <div v-if="showPastEvents" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 class="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span class="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
                            Vergangene Veranstaltungen ({{ pastEventsList.length }})
                        </h2>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th 
                                        @click="toggleSort('title')" 
                                        class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div class="flex items-center gap-1.5">
                                            <span>Veranstaltung</span>
                                            <span class="text-gray-400">
                                                <svg v-if="sortBy === 'title-asc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                                <svg v-else-if="sortBy === 'title-desc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                                <svg v-else class="w-3.5 h-3.5 inline text-gray-300 hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ort</th>
                                    <th 
                                        @click="toggleSort('date')" 
                                        class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    >
                                        <div class="flex items-center justify-center gap-1.5">
                                            <span>Datum</span>
                                            <span class="text-gray-400">
                                                <svg v-if="sortBy === 'date-asc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                                <svg v-else-if="sortBy === 'date-desc'" class="w-3.5 h-3.5 inline text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                                <svg v-else class="w-3.5 h-3.5 inline text-gray-300 hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Helfer</th>
                                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
                                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Aktion</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-100 text-sm">
                                <tr v-for="event in pastEventsList" :key="event.id" class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4 opacity-75">
                                        <div class="flex items-center gap-3">
                                            <img v-if="event.imageUrl" :src="`${apiBase}${event.imageUrl}`" :alt="event.title" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                                            <div v-else class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span class="font-bold text-gray-900">{{ event.title }}</span>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-600 opacity-75">{{ event.location }}</td>
                                    <td class="px-6 py-4 text-center text-gray-600 opacity-75">
                                        {{ formatDate(event.startDate) }}
                                    </td>
                                    <td class="px-6 py-4 text-center font-semibold text-blue-600 opacity-75">
                                        {{ event.promisedHelpers + "/" + event.requiredHelpers }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <span :class="getStatusBadgeClass(event.eventStatus)" class="px-2.5 py-1 rounded-full text-xs font-semibold border">
                                            {{ getStatusLabel(event.eventStatus) }}
                                        </span>
                                        <div v-if="needsAttention(event)" class="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md" :title="getAttentionHint(event)">
                                            <svg class="w-3.5 h-3.5 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                            </svg>
                                            <span>Status prüfen</span>
                                        </div>
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
                                <tr v-if="pastEventsList.length === 0">
                                    <td colspan="6" class="px-6 py-10 text-center text-gray-400 font-medium">Keine vergangenen Veranstaltungen gefunden.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>

        <!-- Event Details Modal (Read-Only) -->
        <div v-if="selectedEvent"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-900">Veranstaltungsdetails</h2>
                    <div class="flex items-center gap-3">
                        <button @click="transitionToEdit"
                            class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            BEARBEITEN
                        </button>
                        <button @click="selectedEvent = null" class="text-gray-400 hover:text-gray-600">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <!-- Left Side: Stammdaten (Read-Only) -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-200 space-y-6">
                        <div v-if="selectedEvent.imageUrl" class="-mx-6 -mt-6 mb-2">
                            <img :src="`${apiBase}${selectedEvent.imageUrl}`" :alt="selectedEvent.title" class="w-full h-48 object-cover" />
                        </div>
                        <div>
                            <div class="space-y-4">
                                <div>
                                    <span class="block text-xs font-bold text-gray-400 uppercase">Titel</span>
                                    <span class="text-lg font-bold text-gray-800">{{ selectedEvent.title }}</span>
                                </div>

                                <div>
                                    <span class="block text-xs font-bold text-gray-400 uppercase">Beschreibung</span>
                                    <p class="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg border border-gray-200 mt-1">
                                        {{ selectedEvent.description || 'Keine Beschreibung vorhanden.' }}
                                    </p>
                                </div>

                                <div>
                                    <span class="block text-xs font-bold text-gray-400 uppercase">Ort</span>
                                    <span class="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mt-1">
                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {{ selectedEvent.location }}
                                    </span>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <span class="block text-xs font-bold text-gray-400 uppercase">Start</span>
                                        <span class="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mt-1">
                                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {{ formatDate(selectedEvent.startDate) }}
                                        </span>
                                    </div>
                                    <div>
                                        <span class="block text-xs font-bold text-gray-400 uppercase">Ende</span>
                                        <span class="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mt-1">
                                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {{ formatDate(selectedEvent.endDate) }}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span class="block text-xs font-bold text-gray-400 uppercase">Event-Status</span>
                                    <div class="mt-1">
                                        <span :class="getStatusBadgeClass(selectedEvent.eventStatus)" class="px-2.5 py-1 rounded-full text-xs font-semibold border inline-block">
                                            {{ getStatusLabel(selectedEvent.eventStatus) }}
                                        </span>
                                        <div v-if="needsAttention(selectedEvent)" class="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                                            <svg class="w-4 h-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                            </svg>
                                            <span>{{ getAttentionHint(selectedEvent) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Side: Dienste (Read-Only) -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col">
                        <h3 class="text-lg font-bold text-gray-900 mb-4">Dienste</h3>

                        <!-- Shift List (Read-Only) -->
                        <div class="space-y-3 flex-1 overflow-y-auto">
                            <div v-for="shift in currentShifts" :key="shift.id"
                                class="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 class="font-bold text-gray-900">{{ shift.name }}</h4>
                                    <p class="text-xs text-gray-500">
                                        {{ shift.points }} Punkte
                                        <span v-if="shift.ageRestriction"> | Mindestalter: {{ shift.ageRestriction }} J.</span>
                                        | {{ getConfirmedHelpers(shift).length }}/{{ shift.requiredHelpers }} Helfer
                                    </p>
                                    <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                                        <span v-for="cat in shift.categories" :key="cat.id"
                                            class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">
                                            {{ cat.name }}
                                        </span>
                                    </div>
                                    <div class="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                                        <h5 class="text-xs font-black uppercase text-gray-400 px-3 pt-3 pb-2">Helfer:innen</h5>

                                        <!-- Bookmarks (view-only) -->
                                        <template v-if="getInterestedHelpers(shift).length > 0">
                                            <div class="px-3 pb-1.5">
                                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                    Vorgemerkt ({{ getInterestedHelpers(shift).length }})
                                                </span>
                                            </div>
                                            <div v-for="helper in getInterestedHelpers(shift)" :key="'int-' + helper.userId"
                                                class="flex items-center px-3 py-1.5 border-t border-gray-100 gap-2 text-sm text-gray-500">
                                                <img v-if="helper.avatarUrl" :src="`${apiBase}${helper.avatarUrl}`" :alt="helper.userName"
                                                    class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                                                <div v-else class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-slate-400" fill="currentColor">
                                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                    </svg>
                                                </div>
                                                <span @click="fetchAndShowUserDetails(helper.userId)" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ helper.userName }}</span>
                                            </div>
                                        </template>

                                        <!-- Applications (Applied - Read-Only) -->
                                        <template v-if="getAppliedHelpers(shift).length > 0">
                                            <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 }">
                                                <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                                                    Angemeldet ({{ getAppliedHelpers(shift).length }})
                                                </span>
                                            </div>
                                            <div v-for="helper in getAppliedHelpers(shift)" :key="'app-' + helper.userId"
                                                class="flex items-center px-3 py-1.5 border-t border-gray-100 gap-2 text-sm text-gray-700 min-w-0">
                                                <img v-if="helper.avatarUrl" :src="`${apiBase}${helper.avatarUrl}`" :alt="helper.userName"
                                                    class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-amber-200" />
                                                <div v-else class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-amber-400" fill="currentColor">
                                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                    </svg>
                                                </div>
                                                <span @click="fetchAndShowUserDetails(helper.userId)" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ helper.userName }}</span>
                                            </div>
                                        </template>

                                        <!-- Confirmed -->
                                        <template v-if="getConfirmedHelpers(shift).length > 0">
                                            <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 || getAppliedHelpers(shift).length > 0 }">
                                                <span class="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                                                    Bestätigt ({{ getConfirmedHelpers(shift).length }})
                                                </span>
                                            </div>
                                            <div v-for="helper in getConfirmedHelpers(shift)" :key="'conf-' + helper.userId"
                                                class="flex items-center px-3 py-1.5 border-t border-gray-100 gap-2 text-sm text-gray-700">
                                                <img v-if="helper.avatarUrl" :src="`${apiBase}${helper.avatarUrl}`" :alt="helper.userName"
                                                    class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-green-200" />
                                                <div v-else class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-green-500" fill="currentColor">
                                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                    </svg>
                                                </div>
                                                <span @click="fetchAndShowUserDetails(helper.userId)" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ helper.userName }}</span>
                                            </div>
                                        </template>

                                        <div v-if="getInterestedHelpers(shift).length === 0 && getAppliedHelpers(shift).length === 0 && getConfirmedHelpers(shift).length === 0"
                                            class="px-3 pb-3 text-xs text-gray-400 italic">
                                            Noch keine Helfer:innen eingetragen
                                        </div>
                                        <div class="pb-1"></div>
                                    </div>
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

        <!-- Edit Event Modal -->
        <div v-if="editingEvent"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-900">Veranstaltung bearbeiten</h2>
                    <button @click="closeEdit" class="text-gray-400 hover:text-gray-600">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <!-- Left Side: Stammdaten Form -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                        <form @submit.prevent="updateEvent" class="space-y-4">
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Titel</label>
                                <input v-model="editForm.title" placeholder="Sommerfest"
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Beschreibung</label>
                                <textarea v-model="editForm.description" rows="4"
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required></textarea>
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Bild</label>
                                <ImageUploadCrop :current-url="editImageCurrentUrl" :aspect-ratio="1" @change="f => editImageFile = f" />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ort</label>
                                <input v-model="editForm.location" placeholder="Marktplatz"
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="flex flex-col">
                                    <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Start</label>
                                    <input v-model="editForm.startDate" type="datetime-local" :min="editMinStartDate"
                                        class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        required />
                                </div>
                                <div class="flex flex-col">
                                    <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ende</label>
                                    <input v-model="editForm.endDate" type="datetime-local"
                                        :min="editMinEndDate"
                                        class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        required />
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Event-Status</label>
                                <select 
                                    v-model="editForm.eventStatus" 
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold"
                                    :class="{ 'border-amber-300 focus:ring-amber-500': editingEventNeedsAttention }"
                                >
                                    <option :value="0">Geplant</option>
                                    <option :value="1">Findet statt</option>
                                    <option :value="2">Durchgeführt</option>
                                    <option :value="3">Abgesagt</option>
                                </select>
                                <div v-if="editingEventNeedsAttention" class="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                                    <svg class="w-4 h-4 shrink-0 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                    <span>{{ editingEventAttentionHint }}</span>
                                </div>
                            </div>
                            
                            <div class="flex gap-4 pt-4">
                                <button type="submit" :disabled="isUpdatingEvent"
                                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-colors disabled:bg-gray-400">
                                    {{ isUpdatingEvent ? 'Wird gespeichert...' : 'Änderungen speichern' }}
                                </button>
                                <button type="button" @click="closeEdit"
                                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-lg font-bold transition-colors">
                                    Abbrechen
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Right Side: Dienste verwalten -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Dienste verwalten</h3>
                            <button @click="startAddShift" v-if="!showShiftForm"
                                class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700">
                                DIENST HINZUFÜGEN
                            </button>
                        </div>

                        <!-- Add/Edit Shift Form -->
                        <div v-if="showShiftForm" class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
                            <input v-model="shiftForm.name" placeholder="Name (z.B. Bar-Dienst)"
                                class="w-full border border-gray-200 p-2 rounded shadow-sm outline-none" />
                            <textarea v-model="shiftForm.description" placeholder="Beschreibung"
                                class="w-full border border-gray-200 p-2 rounded shadow-sm outline-none"></textarea>
                            <div class="grid grid-cols-2 gap-2">
                                <label for="helpers" class="self-center text-sm text-gray-600">Anzahl Helfer</label>
                                <input v-model.number="shiftForm.requiredHelpers" type="number" name="helpers"
                                    placeholder="Helfer Anzahl" class="border border-gray-200 p-2 rounded shadow-sm outline-none" />
                                <label class="self-center text-sm text-gray-600">Schwierigkeitsgrad</label>
                                <select v-model.number="shiftForm.difficulty" class="border border-gray-200 p-2 rounded shadow-sm outline-none bg-white">
                                    <option :value="0">Einfach (10 Pkt/h)</option>
                                    <option :value="1">Mittel (20 Pkt/h)</option>
                                    <option :value="2">Schwer (30 Pkt/h)</option>
                                </select>
                                <label class="self-center text-sm text-gray-600">Mindestalter</label>
                                <input v-model.number="shiftForm.ageRestriction" type="number" min="0"
                                    placeholder="z.B. 16" class="border border-gray-200 p-2 rounded shadow-sm outline-none" />
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-gray-500">Schichtstart</label>
                                    <input v-model="shiftForm.startTime" type="datetime-local"
                                        class="border border-gray-200 p-2 rounded shadow-sm outline-none text-sm" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-gray-500">Schichtende</label>
                                    <input v-model="shiftForm.endTime" type="datetime-local"
                                        class="border border-gray-200 p-2 rounded shadow-sm outline-none text-sm" />
                                </div>
                            </div>
                            <div class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 font-medium">
                                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                {{ shiftPointsPreview }} Punkte ({{ shiftDifficultyLabel(shiftForm.difficulty) }} · {{ shiftDurationLabel }})
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
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Bild <span class="font-normal normal-case text-gray-400">(optional)</span></label>
                                <ImageUploadCrop :current-url="shiftImageCurrentUrl" :aspect-ratio="1" height="8rem" @change="f => shiftImageFile = f" @clear="shiftImageFile = null" />
                            </div>
                            <div class="flex gap-2">
                                <button @click="saveShift" class="flex-1 bg-green-600 text-white py-2 rounded font-bold">{{
                                    shiftForm.id ? 'Aktualisieren' : 'Dienst speichern' }}</button>
                                <button @click="resetShiftForm"
                                    class="flex-1 bg-gray-200 text-gray-600 py-2 rounded font-bold text-sm">Abbrechen</button>
                            </div>
                        </div>

                        <!-- Shifts List (Editable) -->
                        <div class="space-y-3 flex-1 overflow-y-auto">
                            <div v-for="shift in currentShifts" :key="shift.id"
                                class="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 class="font-bold text-gray-900">{{ shift.name }}</h4>
                                    <p class="text-xs text-gray-500">
                                        {{ shift.points }} Punkte
                                        <span v-if="shift.ageRestriction"> | Mindestalter: {{ shift.ageRestriction }} J.</span>
                                        | {{ getConfirmedHelpers(shift).length }}/{{ shift.requiredHelpers }} Helfer
                                    </p>
                                    <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                                        <span v-for="cat in shift.categories" :key="cat.id"
                                            class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">
                                            {{ cat.name }}
                                        </span>
                                    </div>
                                    <div class="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                                        <h5 class="text-xs font-black uppercase text-gray-400 px-3 pt-3 pb-2">Helfer:innen</h5>

                                        <!-- Bookmarks (view-only) -->
                                        <template v-if="getInterestedHelpers(shift).length > 0">
                                            <div class="px-3 pb-1.5">
                                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                    Vorgemerkt ({{ getInterestedHelpers(shift).length }})
                                                </span>
                                            </div>
                                            <div v-for="helper in getInterestedHelpers(shift)" :key="'int-' + helper.userId"
                                                class="flex items-center px-3 py-1.5 border-t border-gray-100 gap-2 text-sm text-gray-500">
                                                <img v-if="helper.avatarUrl" :src="`${apiBase}${helper.avatarUrl}`" :alt="helper.userName"
                                                    class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
                                                <div v-else class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-slate-400" fill="currentColor">
                                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                    </svg>
                                                </div>
                                                <span @click="fetchAndShowUserDetails(helper.userId)" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ helper.userName }}</span>
                                            </div>
                                        </template>

                                        <!-- Applications (Accept/Deny) -->
                                        <template v-if="getAppliedHelpers(shift).length > 0">
                                            <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 }">
                                                <span class="text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                                                    Angemeldet ({{ getAppliedHelpers(shift).length }})
                                                </span>
                                            </div>
                                            <div v-for="helper in getAppliedHelpers(shift)" :key="'app-' + helper.userId"
                                                class="flex items-center justify-between px-3 py-1.5 border-t border-gray-100">
                                                <div class="flex items-center gap-2 text-sm text-gray-700 min-w-0">
                                                    <img v-if="helper.avatarUrl" :src="`${apiBase}${helper.avatarUrl}`" :alt="helper.userName"
                                                        class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-amber-200" />
                                                    <div v-else class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-amber-400" fill="currentColor">
                                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                        </svg>
                                                    </div>
                                                    <span @click="fetchAndShowUserDetails(helper.userId)" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ helper.userName }}</span>
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

                                        <!-- Confirmed -->
                                        <template v-if="getConfirmedHelpers(shift).length > 0">
                                            <div class="px-3 pb-1.5" :class="{ 'pt-3': getInterestedHelpers(shift).length > 0 || getAppliedHelpers(shift).length > 0 }">
                                                <span class="text-[10px] font-bold text-green-600 uppercase tracking-wide">
                                                    Bestätigt ({{ getConfirmedHelpers(shift).length }})
                                                </span>
                                            </div>
                                            <div v-for="helper in getConfirmedHelpers(shift)" :key="'conf-' + helper.userId"
                                                class="flex items-center px-3 py-1.5 border-t border-gray-100 gap-2 text-sm text-gray-700">
                                                <img v-if="helper.avatarUrl" :src="`${apiBase}${helper.avatarUrl}`" :alt="helper.userName"
                                                    class="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-green-200" />
                                                <div v-else class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-green-500" fill="currentColor">
                                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                                    </svg>
                                                </div>
                                                <span @click="fetchAndShowUserDetails(helper.userId)" class="truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-150" title="Profil anzeigen">{{ helper.userName }}</span>
                                            </div>
                                        </template>

                                        <div v-if="getInterestedHelpers(shift).length === 0 && getAppliedHelpers(shift).length === 0 && getConfirmedHelpers(shift).length === 0"
                                            class="px-3 pb-3 text-xs text-gray-400 italic">
                                            Noch keine Helfer:innen eingetragen
                                        </div>
                                        <div class="pb-1"></div>
                                    </div>
                                </div>
                                <div class="flex gap-2 font-bold uppercase text-xs mt-2 justify-end">
                                    <button @click="editShift(shift)"
                                        class="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        Bearbeiten
                                    </button>
                                    <button @click="deleteShift(shift.id)"
                                        class="text-red-500 hover:text-red-700 flex items-center gap-1">
                                        Löschen
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

        <!-- Create Event Modal -->
        <div v-if="showCreateModal"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div class="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-900">Neue Veranstaltung erstellen</h2>
                    <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                    <!-- Left Side: Stammdaten Form -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                        <form @submit.prevent="saveEvent" class="space-y-4">
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Titel</label>
                                <input v-model="newEvent.title" placeholder="Sommerfest"
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Beschreibung</label>
                                <textarea v-model="newEvent.description" rows="4"
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    required></textarea>
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Bild <span class="font-normal normal-case text-gray-400">(optional)</span></label>
                                <ImageUploadCrop :aspect-ratio="1" @change="f => createImageFile = f" @clear="createImageFile = null" />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ort</label>
                                <input v-model="newEvent.location" placeholder="Marktplatz"
                                    class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="flex flex-col">
                                    <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Start</label>
                                    <input v-model="newEvent.startDate" type="datetime-local" :min="minDateTime"
                                        class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        required />
                                </div>
                                <div class="flex flex-col">
                                    <label class="text-xs font-bold text-gray-500 mb-1 uppercase">Ende</label>
                                    <input v-model="newEvent.endDate" type="datetime-local"
                                        :min="newEvent.startDate || minDateTime"
                                        class="border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        required />
                                </div>
                            </div>
                            
                            <div class="flex gap-4 pt-4">
                                <button type="submit" :disabled="isSubmitting"
                                    class="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold transition-colors disabled:bg-gray-400">
                                    {{ isSubmitting ? 'Wird erstellt...' : 'Veranstaltung erstellen' }}
                                </button>
                                <button type="button" @click="closeCreateModal"
                                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-lg font-bold transition-colors">
                                    Abbrechen
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Right Side: Dienste verwalten -->
                    <div class="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Dienste verwalten</h3>
                            <button @click="startAddShift" v-if="!showShiftForm"
                                class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700">
                                DIENST HINZUFÜGEN
                            </button>
                        </div>

                        <!-- Add/Edit Shift Form -->
                        <div v-if="showShiftForm" class="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
                            <input v-model="shiftForm.name" placeholder="Name (z.B. Bar-Dienst)"
                                class="w-full border border-gray-200 p-2 rounded shadow-sm outline-none" />
                            <textarea v-model="shiftForm.description" placeholder="Beschreibung"
                                class="w-full border border-gray-200 p-2 rounded shadow-sm outline-none"></textarea>
                            <div class="grid grid-cols-2 gap-2">
                                <label for="helpers" class="self-center text-sm text-gray-600">Anzahl Helfer</label>
                                <input v-model.number="shiftForm.requiredHelpers" type="number" name="helpers"
                                    placeholder="Helfer Anzahl" class="border border-gray-200 p-2 rounded shadow-sm outline-none" />
                                <label class="self-center text-sm text-gray-600">Schwierigkeitsgrad</label>
                                <select v-model.number="shiftForm.difficulty" class="border border-gray-200 p-2 rounded shadow-sm outline-none bg-white font-semibold">
                                    <option :value="0">Einfach (10 Pkt/h)</option>
                                    <option :value="1">Mittel (20 Pkt/h)</option>
                                    <option :value="2">Schwer (30 Pkt/h)</option>
                                </select>
                                <label class="self-center text-sm text-gray-600">Mindestalter</label>
                                <input v-model.number="shiftForm.ageRestriction" type="number" min="0"
                                    placeholder="z.B. 16" class="border border-gray-200 p-2 rounded shadow-sm outline-none" />
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-gray-500">Schichtstart</label>
                                    <input v-model="shiftForm.startTime" type="datetime-local"
                                        class="border border-gray-200 p-2 rounded shadow-sm outline-none text-sm" />
                                </div>
                                <div class="flex flex-col gap-1">
                                    <label class="text-xs text-gray-500">Schichtende</label>
                                    <input v-model="shiftForm.endTime" type="datetime-local"
                                        class="border border-gray-200 p-2 rounded shadow-sm outline-none text-sm" />
                                </div>
                            </div>
                            <div class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 text-sm text-blue-700 font-medium">
                                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                {{ shiftPointsPreview }} Punkte ({{ shiftDifficultyLabel(shiftForm.difficulty) }} · {{ shiftDurationLabel }})
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
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Bild <span class="font-normal normal-case text-gray-400">(optional)</span></label>
                                <ImageUploadCrop :current-url="shiftImageCurrentUrl" :aspect-ratio="1" height="8rem" @change="f => shiftImageFile = f" @clear="shiftImageFile = null" />
                            </div>
                            <div class="flex gap-2">
                                <button @click="saveShift" class="flex-1 bg-green-600 text-white py-2 rounded font-bold">
                                    {{ shiftForm.id ? 'Aktualisieren' : 'Dienst speichern' }}
                                </button>
                                <button @click="resetShiftForm"
                                    class="flex-1 bg-gray-200 text-gray-600 py-2 rounded font-bold text-sm">Abbrechen</button>
                            </div>
                        </div>

                        <!-- Shifts List (Editable) -->
                        <div class="space-y-3 flex-1 overflow-y-auto">
                            <div v-for="shift in newEventShifts" :key="shift.id"
                                class="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 class="font-bold text-gray-900">{{ shift.name }}</h4>
                                    <p class="text-xs text-gray-500">
                                        {{ shift.points }} Punkte
                                        <span v-if="shift.ageRestriction"> | Mindestalter: {{ shift.ageRestriction }} J.</span>
                                        | 0/{{ shift.requiredHelpers }} Helfer
                                    </p>
                                    <div v-if="shift.categories?.length" class="flex flex-wrap gap-1 mt-1">
                                        <span v-for="cat in shift.categories" :key="cat.id"
                                            class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">
                                            {{ cat.name }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex gap-2 font-bold uppercase text-xs mt-2 justify-end">
                                    <button @click="editShift(shift)"
                                        class="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        Bearbeiten
                                    </button>
                                    <button @click="deleteShift(shift.id)"
                                        class="text-red-500 hover:text-red-700 flex items-center gap-1">
                                        Löschen
                                    </button>
                                </div>
                            </div>
                            <div v-if="newEventShifts.length === 0" class="text-center py-8 text-gray-400 italic text-sm">
                                Noch keine Dienste für dieses Event erstellt.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
import { getAuthHeader, logout, authenticatedFetch, getUserInfo } from '../../assets/utils/auth';

definePageMeta({ middleware: 'auth' })

const config = useRuntimeConfig();
const apiBase = computed(() => config.public.apiBase.replace('/api', ''))
const events = ref([]);
const isLoading = ref(true);

// Search, Filter & Sort State
const searchQuery = ref('');
const selectedDateFilter = ref('');
const selectedStatusFilter = ref('');
const sortBy = ref('date-asc'); // date-asc, date-desc, title-asc, title-desc
const showPastEvents = ref(false);

const filteredAndSortedEvents = computed(() => {
    // 1. Filter
    const result = events.value.filter(event => {
        // Search Query
        const q = searchQuery.value.toLowerCase().trim();
        if (q) {
            const matchesTitle = event.title?.toLowerCase().includes(q);
            const matchesLocation = event.location?.toLowerCase().includes(q);
            if (!matchesTitle && !matchesLocation) return false;
        }

        // Date Filter
        if (selectedDateFilter.value) {
            const filterDate = new Date(selectedDateFilter.value);
            const start = new Date(event.startDate);
            const end = event.endDate ? new Date(event.endDate) : start;
            
            // Format to date strings (ignoring time) to check day match
            const filterDateString = filterDate.toDateString();
            const startDateString = start.toDateString();
            const endDateString = end.toDateString();

            const isExactStart = filterDateString === startDateString;
            const isExactEnd = filterDateString === endDateString;
            const isWithinRange = filterDate >= start && filterDate <= end;

            if (!isExactStart && !isExactEnd && !isWithinRange) {
                return false;
            }
        }

        // Status Filter
        if (selectedStatusFilter.value !== '') {
            const statusNum = Number(selectedStatusFilter.value);
            if (normalizeStatus(event.eventStatus) !== statusNum) {
                return false;
            }
        }

        return true;
    });

    // 2. Sort
    return result.sort((a, b) => {
        if (sortBy.value === 'date-asc') {
            return new Date(a.startDate) - new Date(b.startDate);
        } else if (sortBy.value === 'date-desc') {
            return new Date(b.startDate) - new Date(a.startDate);
        } else if (sortBy.value === 'title-asc') {
            return (a.title || '').localeCompare(b.title || '');
        } else if (sortBy.value === 'title-desc') {
            return (b.title || '').localeCompare(a.title || '');
        }
        return 0;
    });
});

const upcomingEventsList = computed(() => {
    return filteredAndSortedEvents.value.filter(e => {
        const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
        return end >= new Date();
    });
});

const pastEventsList = computed(() => {
    return filteredAndSortedEvents.value.filter(e => {
        const end = e.endDate ? new Date(e.endDate) : new Date(e.startDate);
        return end < new Date();
    });
});

const resetFilters = () => {
    searchQuery.value = '';
    selectedDateFilter.value = '';
    selectedStatusFilter.value = '';
    sortBy.value = 'date-asc';
    evaluateShowPastEventsDefault();
};

const toggleSort = (column) => {
    if (column === 'title') {
        if (sortBy.value === 'title-asc') {
            sortBy.value = 'title-desc';
        } else {
            sortBy.value = 'title-asc';
        }
    } else if (column === 'date') {
        if (sortBy.value === 'date-asc') {
            sortBy.value = 'date-desc';
        } else {
            sortBy.value = 'date-asc';
        }
    }
};

const evaluateShowPastEventsDefault = () => {
    const now = new Date();
    const hasPastNeedingAttention = events.value.some(event => {
        const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
        const isPast = end < now;
        return isPast && needsAttention(event);
    });
    showPastEvents.value = hasPastNeedingAttention;
};

const needsAttention = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : start;
    const status = normalizeStatus(event.eventStatus);

    if (start > now) {
        if (status === 2) {
            return true;
        }
    } else if (end < now) {
        if (status === 0 || status === 1) {
            return true;
        }
    }
    return false;
};

const getAttentionHint = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : start;
    const status = normalizeStatus(event.eventStatus);

    if (start > now && status === 2) {
        return 'Zukünftiges Event kann nicht durchgeführt sein.';
    }
    if (end < now && (status === 0 || status === 1)) {
        return 'Vergangenes Event sollte durchgeführt oder abgesagt sein.';
    }
    return '';
};

const editingEventNeedsAttention = computed(() => {
    if (!editingEvent.value) return false;
    const now = new Date();
    const start = editForm.value.startDate ? new Date(editForm.value.startDate) : null;
    const end = editForm.value.endDate ? new Date(editForm.value.endDate) : start;
    const status = Number(editForm.value.eventStatus);

    if (start && start > now) {
        if (status === 2) return true;
    } else if (end && end < now) {
        if (status === 0 || status === 1) return true;
    }
    return false;
});

const editingEventAttentionHint = computed(() => {
    if (!editingEvent.value) return '';
    const now = new Date();
    const start = editForm.value.startDate ? new Date(editForm.value.startDate) : null;
    const end = editForm.value.endDate ? new Date(editForm.value.endDate) : start;
    const status = Number(editForm.value.eventStatus);

    if (start && start > now && status === 2) {
        return 'Eine Veranstaltung in der Zukunft kann nicht den Status "Durchgeführt" haben.';
    }
    if (end && end < now && (status === 0 || status === 1)) {
        return 'Eine Veranstaltung in der Vergangenheit muss den Status "Durchgeführt" oder "Abgesagt" haben.';
    }
    return '';
});
const isSubmitting = ref(false);
const showForm = ref(false);
const showCreateModal = ref(false);
const newEventShifts = ref([]);
const selectedEvent = ref(null);
const currentShifts = ref([]);
const availableCategories = ref([]);

// Form-States
const newEvent = ref({ title: '', location: '', startDate: '', endDate: '', description: '' });
const showShiftForm = ref(false);
const shiftForm = ref({ id: null, name: '', description: '', requiredHelpers: 1, requirements: '', ageRestriction: 0, difficulty: 0, startTime: '', endTime: '', categoryIds: [] });

// Edit-States
const editingEvent = ref(null);
const editForm = ref({ title: '', location: '', startDate: '', endDate: '', description: '', eventStatus: 0 });
const isUpdatingEvent = ref(false);
const shiftsToDelete = ref([]);

// Image upload states
const createImageFile = ref(null);
const editImageFile = ref(null);

const editImageCurrentUrl = computed(() => {
    if (!editingEvent.value?.imageUrl) return null;
    return `${apiBase.value}${editingEvent.value.imageUrl}`;
});

const uploadEventImage = async (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    await $fetch(`${config.public.apiBase}/events/${eventId}/image`, {
        method: 'POST',
        headers: { Authorization: getAuthHeader() },
        body: formData,
    });
};

// Shift image upload states
const shiftImageFile = ref(null);

const shiftImageCurrentUrl = computed(() => {
    if (shiftImageFile.value) {
        try {
            return URL.createObjectURL(shiftImageFile.value);
        } catch (e) {
            return null;
        }
    }
    if (shiftForm.value?._imageFile) {
        try {
            return URL.createObjectURL(shiftForm.value._imageFile);
        } catch (e) {
            return null;
        }
    }
    if (!shiftForm.value?.imageUrl) return null;
    return `${apiBase.value}${shiftForm.value.imageUrl}`;
});

const uploadShiftImage = async (shiftId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    await $fetch(`${config.public.apiBase}/shifts/${shiftId}/image`, {
        method: 'POST',
        headers: { Authorization: getAuthHeader() },
        body: formData,
    });
};

const showUserPopup = ref(false);
const loadingUserDetail = ref(false);
const userDetailError = ref(null);
const selectedUserDetail = ref(null);

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

const toggleShiftCategory = (id) => {
    const idx = shiftForm.value.categoryIds.indexOf(id);
    if (idx === -1) shiftForm.value.categoryIds.push(id);
    else shiftForm.value.categoryIds.splice(idx, 1);
};

const shiftDifficultyLabel = (d) => ({ 0: 'Einfach', 1: 'Mittel', 2: 'Schwer' }[d] ?? 'Einfach');
const shiftRatePerHour = (d) => ({ 0: 10, 1: 20, 2: 30 }[d] ?? 10);

const shiftDurationLabel = computed(() => {
    const activeEv = editingEvent.value || selectedEvent.value || (showCreateModal.value ? newEvent.value : null);
    const startRaw = shiftForm.value.startTime || activeEv?.startDate;
    const endRaw = shiftForm.value.endTime || activeEv?.endDate;
    if (!startRaw || !endRaw) return '–';
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (end <= start) return '–';
    const h = (end - start) / (1000 * 60 * 60);
    return h < 1 ? `${Math.round(h * 60)} Min` : `${Math.round(h * 10) / 10} Std`;
});

const shiftPointsPreview = computed(() => {
    const rate = shiftRatePerHour(shiftForm.value.difficulty);
    const activeEv = editingEvent.value || selectedEvent.value || (showCreateModal.value ? newEvent.value : null);
    const startRaw = shiftForm.value.startTime || activeEv?.startDate;
    const endRaw = shiftForm.value.endTime || activeEv?.endDate;
    if (!startRaw || !endRaw) return '–';
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (end <= start) return '–';
    const hours = (end - start) / (1000 * 60 * 60);
    return Math.max(1, Math.round(hours * rate));
});

const minDateTime = computed(() => new Date().toISOString().slice(0, 16));

const editMinStartDate = computed(() => {
    const status = Number(editForm.value.eventStatus);
    if (status === 2 || status === 3) {
        return '';
    }
    return minDateTime.value;
});

const editMinEndDate = computed(() => {
    const status = Number(editForm.value.eventStatus);
    if (status === 2 || status === 3) {
        return editForm.value.startDate || '';
    }
    return editForm.value.startDate || minDateTime.value;
});

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

        if (selectedEvent.value) {
            const updated = events.value.find(e => e.id === selectedEvent.value.id);
            if (updated) {
                selectedEvent.value = updated;
                currentShifts.value = (updated.shifts || []).filter(s => !shiftsToDelete.value.includes(s.id));
            }
        }
        evaluateShowPastEventsDefault();
    } catch (error) {
        if (error.status === 401) logout();
    } finally {
        isLoading.value = false;
    }
};

const openCreateModal = () => {
    newEvent.value = { title: '', location: '', startDate: '', endDate: '', description: '' };
    newEventShifts.value = [];
    createImageFile.value = null;
    showCreateModal.value = true;
    resetShiftForm();
};

const closeCreateModal = () => {
    showCreateModal.value = false;
    newEventShifts.value = [];
    newEvent.value = { title: '', location: '', startDate: '', endDate: '', description: '' };
    createImageFile.value = null;
    resetShiftForm();
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
        const response = await authenticatedFetch(`${config.public.apiBase}/events`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const createdEvent = await response.json();
        
        if (createImageFile.value && createdEvent?.id) {
            await uploadEventImage(createdEvent.id, createImageFile.value);
        }

        if (createdEvent?.id && newEventShifts.value.length > 0) {
            for (const shift of newEventShifts.value) {
                const shiftPayload = {
                    name: shift.name,
                    description: shift.description,
                    requiredHelpers: shift.requiredHelpers,
                    ageRestriction: shift.ageRestriction || 0,
                    difficulty: shift.difficulty,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    eventId: createdEvent.id,
                    categoryIds: (shift.categories || []).map(c => c.id)
                };

                const shiftResponse = await authenticatedFetch(`${config.public.apiBase}/shifts`, {
                    method: 'POST',
                    body: JSON.stringify(shiftPayload)
                });

                const createdShift = await shiftResponse.json();

                if (shift._imageFile && createdShift?.id) {
                    await uploadShiftImage(createdShift.id, shift._imageFile);
                }
            }
        }

        closeCreateModal();
        await loadEvents();
    } catch (error) {
        alert("Fehler beim Speichern der Veranstaltung.");
        console.error(error);
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

const formatForDateTimeInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
};

const openEdit = async (event) => {
    editImageFile.value = null;
    editingEvent.value = { ...event };
    editForm.value = {
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDate: formatForDateTimeInput(event.startDate),
        endDate: formatForDateTimeInput(event.endDate),
        eventStatus: normalizeStatus(event.eventStatus)
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
        currentShifts.value = shiftsWithHelpers;
    } catch (error) {
        console.error("Fehler beim Laden der Event-Dienste für Bearbeitung:", error);
    }
};

const closeEdit = () => {
    const evId = editingEvent.value?.id;
    editingEvent.value = null;
    shiftsToDelete.value = [];
    resetShiftForm();
    if (evId) {
        const ev = events.value.find(e => e.id === evId);
        if (ev) {
            openDetails(ev);
        }
    }
};

const transitionToEdit = () => {
    if (!selectedEvent.value) return;
    const ev = { ...selectedEvent.value };
    selectedEvent.value = null;
    openEdit(ev);
};

const updateEvent = async () => {
    if (!editingEvent.value) return;
    isUpdatingEvent.value = true;
    try {
        const payload = {
            id: editingEvent.value.id,
            title: editForm.value.title,
            description: editForm.value.description,
            location: editForm.value.location,
            startDate: editForm.value.startDate,
            endDate: editForm.value.endDate,
            organizationId: editingEvent.value.organizationId,
            eventStatus: parseInt(editForm.value.eventStatus)
        };
        
        await authenticatedFetch(`${config.public.apiBase}/events/${editingEvent.value.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        if (editImageFile.value) {
            await uploadEventImage(editingEvent.value.id, editImageFile.value);
            editImageFile.value = null;
        }

        // Delete the deferred shifts after event update succeeds
        if (shiftsToDelete.value.length > 0) {
            for (const shiftId of shiftsToDelete.value) {
                try {
                    await authenticatedFetch(`${config.public.apiBase}/shifts/${shiftId}`, { method: 'DELETE' });
                } catch (delErr) {
                    console.error(`Fehler beim Löschen des Dienstes ${shiftId}:`, delErr);
                }
            }
            shiftsToDelete.value = [];
        }
        
        closeEdit();
        await loadEvents();
    } catch (error) {
        alert("Fehler beim Aktualisieren des Events.");
        console.error(error);
    } finally {
        isUpdatingEvent.value = false;
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
    shiftImageFile.value = null;
    const activeEv = editingEvent.value || selectedEvent.value || (showCreateModal.value ? newEvent.value : null);
    shiftForm.value = { 
        id: null, 
        name: '', 
        description: '', 
        requiredHelpers: 1, 
        requirements: '', 
        ageRestriction: 0, 
        difficulty: 0, 
        startTime: toLocalDatetime(activeEv?.startDate), 
        endTime: toLocalDatetime(activeEv?.endDate), 
        categoryIds: [] 
    };
};

const startAddShift = () => {
    resetShiftForm();
    showShiftForm.value = true;
};

const toLocalDatetime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
};

const editShift = (shift) => {
    shiftForm.value = {
        ...shift,
        difficulty: shift.difficulty ?? 0,
        startTime: toLocalDatetime(shift.startTime),
        endTime: toLocalDatetime(shift.endTime),
        categoryIds: (shift.categories ?? []).map(c => c.id),
    };
    if (shift._imageFile) {
        shiftForm.value._imageFile = shift._imageFile;
    }
    showShiftForm.value = true;
};

const saveShift = async () => {
    if (!shiftForm.value.name) return alert("Name fehlt");
    
    if (showCreateModal.value) {
        const isEdit = shiftForm.value.id !== null;
        if (isEdit) {
            const idx = newEventShifts.value.findIndex(s => s.id === shiftForm.value.id);
            if (idx !== -1) {
                const rate = shiftRatePerHour(shiftForm.value.difficulty);
                const startRaw = shiftForm.value.startTime || newEvent.value.startDate;
                const endRaw = shiftForm.value.endTime || newEvent.value.endDate;
                let calculatedPoints = 10;
                if (startRaw && endRaw) {
                    const h = (new Date(endRaw) - new Date(startRaw)) / (1000 * 60 * 60);
                    if (h > 0) calculatedPoints = Math.max(1, Math.round(h * rate));
                }
                
                const cats = availableCategories.value.filter(c => shiftForm.value.categoryIds.includes(c.id));
                
                newEventShifts.value[idx] = {
                    ...newEventShifts.value[idx],
                    name: shiftForm.value.name,
                    description: shiftForm.value.description,
                    requiredHelpers: shiftForm.value.requiredHelpers,
                    ageRestriction: shiftForm.value.ageRestriction || 0,
                    difficulty: shiftForm.value.difficulty,
                    startTime: shiftForm.value.startTime,
                    endTime: shiftForm.value.endTime,
                    points: calculatedPoints,
                    categories: cats,
                    _imageFile: shiftImageFile.value || newEventShifts.value[idx]._imageFile
                };
            }
        } else {
            const tempId = -Math.floor(Math.random() * 1000000) - 1;
            const rate = shiftRatePerHour(shiftForm.value.difficulty);
            const startRaw = shiftForm.value.startTime || newEvent.value.startDate;
            const endRaw = shiftForm.value.endTime || newEvent.value.endDate;
            let calculatedPoints = 10;
            if (startRaw && endRaw) {
                const h = (new Date(endRaw) - new Date(startRaw)) / (1000 * 60 * 60);
                if (h > 0) calculatedPoints = Math.max(1, Math.round(h * rate));
            }
            
            const cats = availableCategories.value.filter(c => shiftForm.value.categoryIds.includes(c.id));
            
            newEventShifts.value.push({
                id: tempId,
                name: shiftForm.value.name,
                description: shiftForm.value.description,
                requiredHelpers: shiftForm.value.requiredHelpers,
                ageRestriction: shiftForm.value.ageRestriction || 0,
                difficulty: shiftForm.value.difficulty,
                startTime: shiftForm.value.startTime,
                endTime: shiftForm.value.endTime,
                points: calculatedPoints,
                categories: cats,
                _imageFile: shiftImageFile.value
            });
        }
        resetShiftForm();
        return;
    }

    const activeEv = editingEvent.value || selectedEvent.value;
    if (!activeEv) return;
    try {
        const isEdit = !!shiftForm.value.id;
        const url = isEdit ? `${config.public.apiBase}/shifts/${shiftForm.value.id}` : `${config.public.apiBase}/shifts`;
        const payload = { ...shiftForm.value, eventId: activeEv.id };

        const response = await authenticatedFetch(url, {
            method: isEdit ? 'PUT' : 'POST',
            body: JSON.stringify(payload)
        });

        if (shiftImageFile.value) {
            let shiftId = shiftForm.value.id;
            if (!isEdit) {
                const created = await response.json();
                shiftId = created?.id;
            }
            if (shiftId) await uploadShiftImage(shiftId, shiftImageFile.value);
        }

        resetShiftForm();

        const updatedEvent = await $fetch(`${config.public.apiBase}/events/${activeEv.id}`, {
            params: { includeShifts: true },
            headers: { Authorization: getAuthHeader() }
        });

        if (selectedEvent.value && selectedEvent.value.id === activeEv.id) {
            selectedEvent.value = { ...updatedEvent };
        }
        
        // Preserve helper lists for unchanged shifts to fix Bug 2 when saving/editing a shift
        const newShifts = (updatedEvent.shifts || updatedEvent.Shifts || []).filter(s => !shiftsToDelete.value.includes(s.id));
        for (const ns of newShifts) {
            const existing = currentShifts.value.find(s => s.id === ns.id);
            if (existing && existing.helperList) {
                ns.helperList = existing.helperList;
            } else {
                try {
                    const helpers = await $fetch(`${config.public.apiBase}/participation/shift/${ns.id}`, {
                        headers: { Authorization: getAuthHeader() }
                    });
                    ns.helperList = helpers;
                } catch (helperErr) {
                    console.error(`Fehler beim Laden der Helfer für Dienst ${ns.id}:`, helperErr);
                    ns.helperList = [];
                }
            }
        }
        currentShifts.value = newShifts;

        loadEvents();
    } catch (error) {
        alert("Fehler beim Speichern des Dienstes.");
    }
};

const deleteShift = (shiftId) => {
    if (!confirm("Dienst löschen?")) return;
    
    if (showCreateModal.value) {
        newEventShifts.value = newEventShifts.value.filter(s => s.id !== shiftId);
        return;
    }
    
    // Remove from currentShifts in memory to defer delete
    currentShifts.value = currentShifts.value.filter(s => s.id !== shiftId);
    
    // Track for deletion on save
    if (shiftId) {
        shiftsToDelete.value.push(shiftId);
    }
};

const getInterestedHelpers = (shift) => (shift.helperList || []).filter(h => h.status === 0)
const getAppliedHelpers = (shift) => (shift.helperList || []).filter(h => h.status === 4)
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
            const activeEv = editingEvent.value || selectedEvent.value;
            if (activeEv) {
                if (status === 1 && previousStatus !== 1) {
                    activeEv.promisedHelpers = (activeEv.promisedHelpers || 0) + 1
                } else if (status !== 1 && previousStatus === 1) {
                    activeEv.promisedHelpers = Math.max(0, (activeEv.promisedHelpers || 0) - 1)
                }
                const row = events.value.find(e => e.id === activeEv.id)
                if (row) row.promisedHelpers = activeEv.promisedHelpers
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