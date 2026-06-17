# UI-Verbesserungsplan – Event-Management

## Problem-Analyse
1. **Status-Dropdown erlaubt Rückwärts-Änderungen** – Man kann z.B. von "Veröffentlicht" zurück auf "Entwurf" wechseln
2. **"Durchgeführt" im Dropdown** – Sollte NUR über den Abschluss-Dialog erreichbar sein, nicht manuell
3. **Bewertungen nicht auffindbar** – Es fehlt ein klarer "Bewerten"-Button in der UI
4. **UI-Führung irreführend** – Zu viele Optionen, kein klarer Workflow

---

## Lösung

### 1. Status-Dropdown durch geführten Workflow ersetzen
**Datei:** `organization/events.vue` (Edit-Modal)

- **Status-Dropdown entfernen** und durch geführte Aktions-Buttons ersetzen:
  - `Entwurf` → Button "Veröffentlichen" (setzt Status auf 1)
  - `Veröffentlicht` → Button "Event abschließen" (öffnet Completion-Modal) ODER "Event absagen"
  - `Durchgeführt` → Nur noch "Bewerten"-Button sichtbar
  - `Abgesagt` → Keine Aktionen mehr möglich (read-only)

- **Erlaubte Übergänge:**
  - Draft (0) → Published (1) ✅
  - Published (1) → Accomplished (2) ✅ (nur über /complete Endpoint)
  - Published (1) → Canceled (3) ✅
  - Draft (0) → Canceled (3) ✅
  - Alles andere ❌

### 2. Aktions-Leiste im Detail-Modal
**Datei:** `organization/events.vue` (Detail-Modal Header)

- Klare Aktions-Buttons je nach aktuellem Status:
  - **Entwurf**: [Veröffentlichen] [Bearbeiten] [Absagen]
  - **Veröffentlicht**: [Abschließen] [Bearbeiten] [Absagen]
  - **Durchgeführt**: [Bewerten]
  - **Abgesagt**: (keine Aktionen)

### 3. Bewertungs-Button prominent platzieren
- In der **Event-Tabelle**: "Bewerten" Button bei Status "Durchgeführt"
- Im **Detail-Modal**: Großer "Helfer bewerten" Button im Header
- Im **Dashboard**: Nach Abschluss direkt Bewertung anbieten

### 4. Status-Anzeige als Badge statt Dropdown
- Status wird als farbiges Badge angezeigt (read-only)
- Änderungen nur über die expliziten Aktions-Buttons

---

## Implementierung

### Schritt 1: Edit-Modal – Status-Dropdown durch Aktions-Buttons ersetzen
- Dropdown `<select v-model="editForm.eventStatus">` entfernen
- Stattdessen: Status als Badge + Aktions-Buttons darunter

### Schritt 2: Detail-Modal – Aktions-Buttons im Header
- "Veröffentlichen", "Abschließen", "Bewerten", "Absagen" Buttons je nach Status

### Schritt 3: Tabelle – Kontext-Aktionen
- "Veröffentlichen" bei Entwurf-Events
- "Abschließen" bei veröffentlichten vergangenen Events  
- "Bewerten" bei durchgeführten Events

### Schritt 4: Publish-Funktion implementieren
- `publishEvent(event)` → PUT mit eventStatus: 1

### Schritt 5: Cancel-Funktion implementieren
- `cancelEvent(event)` → PUT mit eventStatus: 3
