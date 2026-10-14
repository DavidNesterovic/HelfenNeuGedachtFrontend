# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nuxt 4 / Vue 3 frontend for **HelfenNeuGedacht**, a volunteer-management platform. Organizations create events with shifts, and volunteers (helpers) sign up for them. The UI, comments and docs are mostly in **German**, so keep user-facing text in German. The backend is a separate ASP.NET Core API (default `http://localhost:5062`), and this repo has no server code of its own.

## Commands

```bash
npm install            # also runs `nuxt prepare` (generates .nuxt/, which ESLint config + tsconfig depend on)
npm run dev            # dev server on http://localhost:3000
npm run build          # production build -> .output/
npm run preview        # serve the production build
npm run lint           # ESLint (errors block CI, warnings don't)
npm run typecheck      # nuxt typecheck (vue-tsc), any error blocks CI
npm test               # Vitest unit tests (test/**/*.test.js), failing tests block CI
npm run test:coverage  # same, plus coverage report in coverage/
npm run license:check  # dependency license policy (scripts/check-licenses.mjs)
npm run audit:check    # the blocking audit CI runs: high/critical prod advisories, minus audit-exceptions.json
```

Before you push, check your work with lint, typecheck and tests.

Tests live in `test/` (plain JS) and run in the `nuxt` Vitest environment (`vitest.config.mjs`, `@nuxt/test-utils`, happy-dom), so auto-imports work. Stub auto-imported functions like `navigateTo` or `$fetch` with `mockNuxtImport` and `vi.hoisted`. `test/helpers/jwt.js` builds fake JWTs.

## Architecture

- **Source lives in `app/`** (Nuxt 4 layout): `pages/` uses file-based routing, `components/` holds auto-imported components (generic `App*` UI primitives plus feature components like `OrgEvent*Modal`), `composables/`, `layouts/` and `middleware/`. Most files are plain JS `<script setup>`. Only a few use `lang="ts"`.
- **Two user areas, split by role:**
  - Volunteer pages (`events.vue`, `event/[id].vue`, `user/*`) use `layout: 'user'` (mobile-first, `BottomNav`).
  - Organization pages (`organization/*`) use the `default` layout (fixed sidebar `OrganizationMenu`).
  - Auth pages (login, register, password reset, org registration) set `layout: false`.
  - Protected pages opt in with `definePageMeta({ middleware: 'auth' })`. There is no global guard.
- **Auth is client-side JWT in localStorage.** It is handled by `app/assets/utils/auth.js` (`saveToken`, `getAuthHeader`, `authenticatedFetch`, `getUserRole`, `getHomeRoute`). The role claim can arrive as the full ASP.NET `ClaimTypes.Role` URI key. `OrganizationUser`/`OrganizationAdmin`/`SuperAdmin` are routed to `/organization/dashboard` and everyone else to `/events`. Token claims such as `OrganizationId` are read with `getUserInfo()`. Auth checks only run on the client (`process.client`), because there is no server session.
- **API calls** go to `useRuntimeConfig().public.apiBase` (set in `nuxt.config.ts`; the standard Nuxt env override is `NUXT_PUBLIC_API_BASE`). There are two patterns:
  - `$fetch(url, { headers: { Authorization: getAuthHeader() } })`
  - `authenticatedFetch(url, opts)`, which uses native fetch, sets JSON Content-Type unless the body is FormData, and logs out on 401.

  Image URLs from the API are relative, so build them by stripping `/api` from `apiBase` (see `useCurrentUser`, `EventCard`).
- **Realtime:** `organization/dashboard.vue` connects to the SignalR hub at `${public.hubBase}/dashboard` (`@microsoft/signalr`, WebSockets, token through `accessTokenFactory`).
- **Global UI services** are mounted once in `app.vue`:
  - `useDialog()` gives promise-based `alert`/`confirm` backed by `AppDialog`. Its state is module-level refs.
  - `useSnackbar()` shows toasts backed by `AppSnackbar`. Its state is `useState`.

  Use these instead of `window.alert`/`confirm`.
- **Event status** is numeric: Draft 0 → Published 1 → Accomplished 2 (only through the `/complete` endpoint) / Canceled 3. Helpers live in `useEventStatus`. `docs/ui-improvement-plan.md` describes the intended guided status workflow.
- `public/scripts/auth.js` and `config.js` are leftovers from the old static-HTML frontend. The Nuxt app uses `app/assets/utils/auth.js`.

## Lint rules that matter

These are set in `eslint.config.mjs`. Rules at `error` fail the pipeline:
- Using `eval`, `new Function`, or `v-html` fails the build.
- `debugger` fails the build.
- A page with multiple root elements is also an error, because it breaks Nuxt transitions.

`console.log` only produces a warning; `console.warn` and `console.error` are allowed.

## CI/CD

See `docs/pipeline.md` and `docs/quality-gate.md` for what the gate checks and which failures block.

- `.github/workflows/quality-gate.yml` runs on every PR and is also called as a reusable workflow. It runs ESLint + typecheck, Semgrep, npm audit, gitleaks (full history) and the license check.
- `docker-publish.yml` ("Build & Release") runs on pushes to `master` and on `v*` tags. It runs the gate, builds the two-stage `node:24-alpine` image (only `.output/`, non-root, no package managers), scans it with Trivy and pushes it to `ghcr.io/lgiselbrecht/helfenneugedacht.frontend`:
  - `master` → `latest` + `edge` + `sha-<commit>`, then deploy via Komodo webhook
  - tag `vX.Y.Z` → `X.Y.Z`, `X.Y`, `latest`, plus a GitHub Release with notes from git-cliff (`cliff.toml`, preview with `npm run release:notes`)
- Releases are cut by pushing a semver tag on `master`; the tag is the only version source. See `docs/release.md`. Use conventional commit prefixes (`feat:`, `fix:`, ...) so commits land in the right release-notes section.
- CI and Docker use Node 24. Keep `package-lock.json` in sync, because CI uses `npm ci`.
- **After any `npm install`/`npm update` on Windows, regenerate the lockfile on Linux** (`docs/pipeline.md`, "Known pitfalls"), otherwise Linux-only optional deps such as `@emnapi/*` go missing and `npm ci` fails in CI.
- Accepted npm advisories live in `audit-exceptions.json` (GHSA id, reason, expiry). Only add one when there is no usable fix and the package doesn't end up in `.output/`.
