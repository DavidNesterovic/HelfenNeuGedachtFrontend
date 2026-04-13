<template>
  <div class="wizard-container">
    <div class="card-header" style="text-align: center; margin-bottom: 30px;">

      <h2>Login</h2>

    </div>

    <div class="form-section" id="loginForm">
      <div id="errorMessage" class="alert-box"
        style="display: none; background-color: #fee; border-left: 4px solid #c33;">
        <div class="alert-header">
          <span id="errorText">Fehler</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="email">E-Mail-Adresse</label>
        <input type="email" id="email" class="form-input" placeholder="ihre.email@beispiel.at" required autofocus>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Passwort</label>
        <input type="password" id="password" class="form-input" placeholder="Ihr Passwort" required>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-primary btn-lg btn-block" onclick="login()">
          Anmelden
        </button>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);">
        <p style="color: var(--muted-foreground); margin-bottom: 10px;">
          Noch keine Organisation registriert?
        </p>
        <a href="organization_registration.html" class="btn btn-outline">
          Jetzt Organisation registrieren →
        </a>
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