<template>
    <main class="main-content">
        <header class="page-header">
            <div class="page-title">
                <h1>Organisation verwalten</h1>
                <p>Hier können Sie die Daten Ihrer Organisation einsehen und bearbeiten</p>
            </div>
        </header>

        <!-- Loading State -->
        <div id="loadingState" class="card text-center" style="padding: 40px;">
            <p>Lade Organisationsdaten...</p>
        </div>

        <!-- Error State -->
        <div id="errorState" class="card hidden" style="padding: 24px; border-color: #ef4444;">
            <h3 style="color: #ef4444; margin-bottom: 12px;">Fehler</h3>
            <p id="errorMessage"></p>
        </div>

        <!-- Organization Form -->
        <div id="organizationForm" class="hidden">
            <form id="orgForm">
                <!-- Grundlegende Informationen -->
                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="margin-bottom: 24px;">Grundlegende Informationen</h3>

                    <div class="form-group">
                        <label class="form-label" for="name">Name der Organisation *</label>
                        <input type="text" id="name" name="name" class="form-input" required
                            placeholder="z.B. Freiwillige Feuerwehr Musterstadt">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="description">Beschreibung</label>
                        <textarea id="description" name="description" class="form-input" rows="4"
                            placeholder="Kurze Beschreibung Ihrer Organisation"></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="type">Typ</label>
                            <select id="type" name="type" class="form-select">
                                <option value="">Bitte auswählen...</option>
                                <option value="Verein">Verein</option>
                                <option value="Gemeinde">Gemeinde</option>
                                <option value="Feuerwehr">Feuerwehr</option>
                                <option value="THW">THW (Technisches Hilfswerk)</option>
                                <option value="Kirche">Kirche / Religiöse Organisation</option>
                                <option value="NGO">NGO / Non-Profit Organisation</option>
                                <option value="Sonstige">Sonstige</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="registrationNumber">Registrierungsnummer *</label>
                            <input type="text" id="registrationNumber" name="registrationNumber" class="form-input"
                                required placeholder="z.B. VR 12345">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="website">Webseite</label>
                        <input type="url" id="website" name="website" class="form-input"
                            placeholder="https://www.example.com">
                    </div>
                </div>

                <!-- Adresse -->
                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="margin-bottom: 24px;">Adresse</h3>

                    <div class="form-group">
                        <label class="form-label" for="street">Straße und Hausnummer</label>
                        <input type="text" id="street" name="street" class="form-input"
                            placeholder="z.B. Musterstraße 123">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="postalCode">Postleitzahl</label>
                            <input type="text" id="postalCode" name="postalCode" class="form-input"
                                placeholder="z.B. 12345">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="city">Stadt</label>
                            <input type="text" id="city" name="city" class="form-input" placeholder="z.B. Musterstadt">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="state">Bundesland</label>
                            <input type="text" id="state" name="state" class="form-input" placeholder="z.B. Vorarlberg">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="country">Land</label>
                            <input type="text" id="country" name="country" class="form-input"
                                placeholder="z.B. Österreich">
                        </div>
                    </div>
                </div>

                <!-- Kontaktinformationen -->
                <div class="card" style="margin-bottom: 24px;">
                    <h3 style="margin-bottom: 24px;">Kontaktinformationen</h3>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="contactEmail">Kontakt-E-Mail *</label>
                            <input type="email" id="contactEmail" name="contactEmail" class="form-input" required
                                placeholder="kontakt@example.com">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="contactPhone">Kontakt-Telefon</label>
                            <input type="tel" id="contactPhone" name="contactPhone" class="form-input"
                                placeholder="+49 123 456789">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="contactPersonName">Name der Kontaktperson</label>
                            <input type="text" id="contactPersonName" name="contactPersonName" class="form-input"
                                placeholder="z.B. Max Mustermann">
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="contactPersonRole">Rolle der Kontaktperson</label>
                            <input type="text" id="contactPersonRole" name="contactPersonRole" class="form-input"
                                placeholder="z.B. Vorsitzende/r">
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="form-actions">
                    <button type="submit" class="btn-primary btn-lg">
                        Änderungen speichern
                    </button>
                    <button type="button" onclick="loadOrganizationData()" class="btn btn-outline btn-lg">
                        Zurücksetzen
                    </button>
                </div>
            </form>
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