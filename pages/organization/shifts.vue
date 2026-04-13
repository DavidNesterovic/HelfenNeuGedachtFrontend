<template>
    <main>
        <div class="main-content">
            <header class="page-header">
                <div class="page-title">
                    <h1>Dienste</h1>
                    <p>Verwalten Sie Ihre Dienstvorlagen</p>
                </div>
                <button class="btn-primary" id="showShiftFormBtn">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    NEUEN DIENST ERSTELLEN
                </button>
            </header>
            <div class="shift-grid" id="cardwrapper"></div>
        </div>
        <!-- Shift Details Modal -->
        <div class="modal-overlay" id="shiftDetailsModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-header-top">
                        <div class="modal-header-title">
                            <div class="modal-header-icon"></div>
                            <h2 id="detailShiftTitle">Lade Dienst...</h2>
                        </div>
                        <button class="modal-close-btn" id="closeShiftModalBtn">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="editShiftForm" class="form-container">
                        <input type="number" id="editShiftId" placeholder="ID" required>
                        <label for="editShiftTitle">Titel</label>
                        <input type="text" id="editShiftTitle" required>
                        <label for="editShiftDescription">Beschreibung</label>
                        <textarea id="editShiftDescription" rows="3" required></textarea>
                        <label for="editShiftRequirements">Anforderungen</label>
                        <input type="text" id="editShiftRequirements">
                        <label for="editShiftAgeRestriction">Altersbeschränkung</label>
                        <input type="number" id="editShiftAgeRestriction">
                        <label for="editShiftPoints">Punkte</label>
                        <input type="number" id="editShiftPoints">
                        <label for="editShiftRelatedEvent">Zugewiesene Veranstaltung</label>
                        <select id="editShiftRelatedEvent" required></select>
                        <div class="form-actions-row">
                            <button type="submit" class="btn-primary">Speichern</button>
                            <button type="button" class="btn-danger" id="deleteShiftButton">Löschen</button>
                            <button type="button" id="cancelEditingShiftFormBtn"
                                class="btn-secondary">Abbrechen</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Shift Add Modal -->
        <div class="modal-overlay" id="shiftEditModal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-header-top">
                        <div class="modal-header-title">
                            <div class="modal-header-icon"></div>
                            <h2 id="modalShiftTitle">Neuen Dienst erstellen</h2>
                        </div>
                        <button class="modal-close-btn" id="closeEditShiftModalBtn">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="modal-body">
                    <form id="createShiftForm" class="form-container">
                        <label for="shiftTitle">Bezeichnung</label>
                        <input type="text" id="shiftTitle" required>
                        <label for="shiftDescription">Beschreibung</label>
                        <textarea id="shiftDescription" rows="3" required></textarea>
                        <label for="shiftRequirements">Anforderungen</label>
                        <input type="text" id="shiftRequirements">
                        <label for="shiftAgeRestriction">Altersbeschränkung</label>
                        <input type="number" id="shiftAgeRestriction">
                        <label for="shiftPoints">Punkte</label>
                        <input type="number" id="shiftPoints">
                        <label for="shiftRelatedEvents">zugewiesene Veranstaltung</label>
                        <select id="shiftRelatedEvent" required></select>
                        <div class="form-actions-row">
                            <button type="submit" class="btn-primary">Speichern</button>
                            <button type="button" id="cancelShiftFormBtn" class="btn-secondary">Abbrechen</button>
                        </div>
                    </form>
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