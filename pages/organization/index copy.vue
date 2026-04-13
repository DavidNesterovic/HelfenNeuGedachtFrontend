<template>
  <div class="wizard-container">
    <!-- Wizard Steps Progress -->
    <div class="wizard-steps">
      <div class="wizard-step active" id="step1-indicator">
        <div class="wizard-step-circle">1</div>
        <div class="wizard-step-label">Kontakt-Informationen</div>
      </div>
      <div class="wizard-step" id="step2-indicator">
        <div class="wizard-step-circle">2</div>
        <div class="wizard-step-label">Organisation-Details</div>
      </div>
      <div class="wizard-step" id="step3-indicator">
        <div class="wizard-step-circle">3</div>
        <div class="wizard-step-label">Bestätigung</div>
      </div>
    </div>

    <!-- Step 1: Kontakt-Informationen -->
    <div class="form-section" id="step1" style="display: block;">
      <div class="card-header">
        <div>
          <h2>Kontakt-Informationen</h2>
          <p style="color: var(--text-muted); font-size: 14px;">Erstellen Sie Ihr Administrator-Konto</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="contactPersonName">Vor- und Nachname</label>
        <input type="text" id="contactPersonName" class="form-input" placeholder="Max Musterman" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="contactEmail">E-Mail-Adresse</label>
        <input type="email" id="contactEmail" class="form-input" placeholder="ihre.email@beispiel.at" required>
        <div class="form-hint">Diese E-Mail wird für Login und Benachrichtigungen verwendet</div>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Passwort</label>
        <input type="password" id="password" class="form-input" placeholder="Mindestens 8 Zeichen" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="passwordConfirm">Passwort bestätigen</label>
        <input type="password" id="passwordConfirm" class="form-input" placeholder="Passwort wiederholen" required>
      </div>

      <div class="form-actions">
        <a href="login.html" class="btn btn-outline">
          Bereits registriert? Zum Login
        </a>
        <button type="button" class="btn btn-primary" onclick="nextStep(2)">
          Weiter →
        </button>
      </div>
    </div>

    <!-- Step 2: Organisation-Details -->
    <div class="form-section" id="step2" style="display: none;">
      <div class="card-header">

        <div>
          <h2>Organisation-Details</h2>
          <p style="color: var(--text-muted); font-size: 14px;">Informationen über Ihre Organisation</p>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="organizationName">Name der Organisation</label>
        <input type="text" id="organizationName" class="form-input" placeholder="z.B. Sportverein Musterstadt e.V."
          required>
      </div>

      <div class="form-group">
        <label class="form-label" for="registrationNumber">Vereinsregisternummer</label>
        <input type="text" id="registrationNumber" class="form-input" placeholder="z.B. VR 12345">
        <div class="form-hint">Optional, aber empfohlen für die Verifizierung</div>
      </div>

      <div class="form-group">
        <label class="form-label" for="organizationType">Art der Organisation</label>
        <select id="organizationType" class="form-select" required>
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
        <label class="form-label" for="street">Straße und Hausnummer</label>
        <input type="text" id="street" class="form-input" placeholder="z.B. Hauptstraße 123" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="postalCode">Postleitzahl</label>
          <input type="text" id="postalCode" class="form-input" placeholder="z.B. 12345" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="city">Stadt</label>
          <input type="text" id="city" class="form-input" placeholder="z.B. Musterstadt" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="contactPhone">Telefonnummer (optional)</label>
        <input type="tel" id="contactPhone" class="form-input" placeholder="z.B. +49 123 456789">
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="prevStep(1)">
          ← Zurück
        </button>
        <button type="button" class="btn btn-primary" onclick="nextStep(3)">
          Weiter →
        </button>
      </div>
    </div>

    <!-- Step 3: Bestätigung & Datenschutz -->
    <div class="form-section" id="step3" style="display: none;">
      <div class="card-header">
        <div>
          <h2>Bestätigung & Datenschutz</h2>
          <p style="color: var(--text-muted); font-size: 14px;">Bestätigen Sie Ihre Angaben</p>
        </div>
      </div>

      <!-- Zusammenfassung -->
      <h3 style="margin-bottom: 16px; font-size: 16px;">Ihre E-Mail</h3>
      <div class="summary-section">
        <div class="summary-value" id="summaryEmail">-</div>
      </div>

      <h3 style="margin-bottom: 16px; font-size: 16px;">Organisation</h3>
      <div class="summary-section">
        <div class="summary-value" id="summaryOrgName">-</div>
      </div>

      <h3 style="margin-bottom: 16px; font-size: 16px;">Adresse</h3>
      <div class="summary-section">
        <div class="summary-value" id="summaryAddress">-</div>
      </div>

      <!-- Checkboxen -->
      <div style="margin-top: 24px;">
        <div class="checkbox-group">
          <input type="checkbox" id="acceptTerms" class="checkbox-input" required>
          <label for="acceptTerms" class="checkbox-label">
            Ich akzeptiere die <a href="#"
              onclick="alert('Nutzungsbedingungen (noch nicht verfügbar)'); return false;">Nutzungsbedingungen</a>
          </label>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="acceptPrivacy" class="checkbox-input" required>
          <label for="acceptPrivacy" class="checkbox-label">
            Ich habe die <a href="#"
              onclick="alert('Datenschutzerklärung (noch nicht verfügbar)'); return false;">Datenschutzerklärung</a>
            gelesen und stimme zu
          </label>
        </div>

        <div class="checkbox-group">
          <input type="checkbox" id="acceptNewsletter" class="checkbox-input">
          <label for="acceptNewsletter" class="checkbox-label">
            Ich möchte Updates und Neuigkeiten per E-Mail erhalten (optional)
          </label>
        </div>
      </div>


      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="prevStep(2)">
          Zurück
        </button>
        <button type="button" class="btn btn-primary btn-lg" onclick="submitRegistration()">
          Registrierung abschließen
        </button>
      </div>
    </div>

    <!-- Erfolgsmeldung (versteckt) -->
    <div class="form-section" id="successMessage" style="display: none;">
      <div class="text-center">
        <h2>Registrierung erfolgreich!</h2>
        <p style="color: var(--text-muted); margin: 16px 0;">
          Ihre Organisation wurde erfolgreich registriert. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
        </p>
        <button type="button" class="btn btn-primary btn-lg" onclick="window.location.href='dashboard.html'">
          Zum Dashboard →
        </button>
      </div>
    </div>
  </div>
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