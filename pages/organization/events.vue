<template>
    <main>
        <div class="main-content">
            <header class="page-header">
                <div class="page-title">
                    <h1>Veranstaltungen</h1>
                    <p>Verwalten Sie Ihre Events und die zugehörigen Dienste</p>
                </div>
                <button class="btn-primary" id="showFormBtn">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    NEUE VERANSTALTUNG ERSTELLEN
                </button>
            </header>

            <form id="createEventForm" class="form-container hidden">
                <div class="form-group">
                    <label class="form-label">Veranstaltungsname</label>
                    <input type="text" id="eventTitle" placeholder="z.B. Sommerfest 2026" class="form-input" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Beschreibung</label>
                    <textarea id="eventDescription" placeholder="Worum geht es in dieser Veranstaltung?"
                        class="form-input" rows="3" required></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Ort</label>
                    <input type="text" id="eventLocation" placeholder="z.B. Marktplatz, Hauptstraße" class="form-input"
                        required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start</label>
                        <input type="datetime-local" id="eventStartDate" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ende</label>
                        <input type="datetime-local" id="eventEndDate" class="form-input" required>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" id="cancelFormBtn" class="btn btn-secondary">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Veranstaltung speichern</button>
                </div>
            </form>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">Veranstaltung</th>
                            <th class="text-center">Ort</th>
                            <th class="text-center">Startdatum</th>
                            <th class="text-center">Enddatum</th>
                            <th class="text-center">Anzahl Helfer</th>
                            <th class="text-center">Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="6" class="loading-text-td">Lade Veranstaltungen ...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="modal-overlay" id="eventDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-header-top">
                        <h2 id="modalEventTitle">Lade Event...</h2>
                        <button class="modal-close-btn" id="closeModalBtn">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-header-info">
                        <div class="modal-info-item">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                                </path>
                            </svg>
                            <span id="modalEventDate"></span>
                        </div>
                        <div class="modal-info-item">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                                </path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span id="modalEventLocation"></span>
                        </div>
                        <div class="modal-info-item">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                                </path>
                            </svg>
                            <span id="modalEventHelpers">--/-- Helfer</span>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-section-header">
                        <h3 class="modal-section-title">Dienste</h3>
                        <button class="btn-primary modal-btn-small" id="addShiftBtn">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v16m8-8H4">
                                </path>
                            </svg>
                            NEUEN DIENST HINZUFÜGEN
                        </button>
                    </div>

                    <div id="addShiftContainer" class="shift-form-container hidden">
                        <form id="createShiftForm" class="form-container">
                            <label for="newShiftName">Bezeichnung</label>
                            <input type="text" id="newShiftName" required placeholder="Name (z.B. Bar-Dienst)">

                            <label for="newShiftDesc">Beschreibung</label>
                            <textarea id="newShiftDesc" rows="3" required
                                placeholder="Optionale Details zum Dienst..."></textarea>

                            <label for="newShiftRequirements">Anforderungen</label>
                            <input type="text" id="newShiftRequirements" placeholder="z.B. Führerschein Klasse B">

                            <label for="newShiftAgeRestriction">Altersbeschränkung</label>
                            <input type="number" id="newShiftAgeRestriction" placeholder="z.B. 18">

                            <label for="newShiftPoints">Punkte</label>
                            <input type="number" id="newShiftPoints" value="10">

                            <label for="newShiftRequiredHelpers">Benötigte Helfer</label>
                            <input type="number" id="newShiftRequiredHelpers" value="1" min="1">

                            <div class="form-actions-row">
                                <button type="submit" class="btn-primary" onclick="submitNewShift()">Dienst
                                    speichern</button>
                                <button type="button" class="btn btn-secondary"
                                    onclick="toggleShiftForm(false)">Abbrechen</button>
                            </div>
                        </form>
                    </div>
                    <div class="shift-list" id="modalShiftList">
                        <div class="loading-placeholder">Lade Dienste...</div>
                    </div>
                </div>
            </div>
        </div>
    </main>

</template>

<script setup>
onMounted(() => {
    setTimeout(() => {
        const authenticated = localStorage.getItem('token')

        if (authenticated) {
            navigateTo('/dashboard')
        } else {
            navigateTo('/login')
        }
    }, 500)
})
</script>