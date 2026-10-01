# HelfenNeuGedacht Frontend – Fresszettel Refactoring #1 (Diskussionsgrundlage)

**Repo:** https://github.com/DavidNesterovic/HelfenNeuGedachtFrontend · **Stack:** Nuxt 4 / Vue 3 / Tailwind / SignalR · Node 24
**Code:** `app/pages` (`/events`, `/event/[id]`, `/user/*` = Helfer:innen, `/organization/*` = Organisationen, Login/Register/Passwort) · `app/components` (`App*` = UI-Bausteine, `OrgEvent*Modal` = Event-Verwaltung) · `app/composables` · `app/middleware/auth.js` · `app/assets/utils/auth.js` (Token/JWT) · `app/layouts` (`default` = Org-Sidebar, `user` = BottomNav)
**Config/Betrieb:** `nuxt.config.ts` (API-/Hub-URL), `Dockerfile`, `.github/workflows/` (Quality Gate, Docker-Publish), `docs/` (Pipeline, Quality Gate, UI-Plan)

## Security (Priorität)
- **JWT im `localStorage`** (plus dekodierter Payload als zweiter Key) → jede XSS-Lücke kann den Token auslesen; zusammen mit 15 Tagen Gültigkeit im Backend kritisch. Positiv: kein `v-html`.
- **Keine Rollenprüfung im Routing** – Middleware `auth` prüft nur „eingeloggt“ und läuft nur client-seitig; normale Helfer:innen können `/organization/dashboard|events|shifts` öffnen. Schutz hängt komplett an der API (die dort Lücken hat, siehe API-Fresszettel).
- **Abgelaufener Token wird meist nicht erkannt** – nur `authenticatedFetch` (11 Aufrufe) loggt bei 401 aus, die ~60 `$fetch`-Aufrufe nicht.
- `apiBase`/`hubBase` hart auf `http://localhost:5062` in `nuxt.config.ts`; Prod-Override per `NUXT_PUBLIC_*` nirgends dokumentiert, HTTPS nicht erzwungen.
- `.claude/settings.local.json` und `.vs/` (inkl. `slnx.sqlite`) sind eingecheckt → entfernen + `.gitignore`; 33 `console.*`-Aufrufe (u. a. Ausgabe der Runtime-Config) auch in Prod.

## Architektur / Verständlichkeit
- **Keine zentrale API-Schicht** – 20 Dateien bauen URL + `Authorization`-Header selbst, drei Fetch-Varianten (`authenticatedFetch`, `$fetch`, `fetch`) → ein `useApi()`/`$fetch.create`-Plugin (Base-URL, Token, 401, Fehler) + Services je Domäne.
- **`auth.js` liegt in `assets/`** (gedacht für CSS/Bilder) → `app/utils` bzw. `useAuth()`-Composable; User-State teils `useState`, teils `localStorage`.
- **Zu große Komponenten**: `organization/dashboard.vue` (490 Z., inkl. SignalR-Setup), `OrgEventEditModal` (465), `organization/shifts.vue` (422), `organization/events.vue` (398) → aufteilen, SignalR in `useDashboardHub()`.
- **`OrgEventCreateModal` / `OrgEventEditModal`** duplizieren Formular + Validierung → gemeinsame `EventForm`-Komponente.
- **Status-Logik verstreut** – `useEventStatus` existiert, trotzdem hartkodierte Labels/Zahlen (`0/1/3`) in `EventCard`, `event/[id]`, `my-events`, `organization/events`.
- Asset-URLs 7× per `apiBase.replace('/api', '')` gebaut → eigene Config `assetBase` oder Helper.
- JS/TS-Mix: TypeScript + `vue-tsc` installiert, aber nur 6 Dateien `lang="ts"` → entscheiden und einheitlich machen (z. B. API-Typen).
- Fehlerbehandlung uneinheitlich (leere `catch {}`, Meldungen mal Snackbar, mal Inline); keine Tests; `README.md` ist noch das Nuxt-Starter-Template.
