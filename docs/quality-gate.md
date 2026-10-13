# Quality Gate

Every pull request runs `.github/workflows/quality-gate.yml`. On `master`, `docker-publish.yml` runs the same gate first and only builds and pushes the image if the gate passes. After the build, the image itself is scanned before `docker push`.

## Overview

| Area | Tool | **Stops the pipeline** | **Warning only** |
|---|---|---|---|
| Static analysis | ESLint (`@nuxt/eslint`) | Rules at `error`: Vue/Nuxt correctness (e.g. a page with more than one root element), `no-eval`, `no-new-func`, `vue/no-v-html`, `debugger` | Rules at `warn`: unused variables, `any`, `console.log`, empty blocks, deprecated `process.client`, formatting and attribute order |
| Static analysis | `nuxt typecheck` (vue-tsc) | Any type error | – |
| Tests | Vitest (`@nuxt/test-utils`, files in `test/`) | Any failing test | Coverage is only reported (job summary + `coverage-report` artifact), there is no minimum yet |
| Security: code (SAST) | Semgrep (`p/javascript`, `p/typescript`, `p/owasp-top-ten`) | Findings with severity `ERROR` | Findings with severity `WARNING` / `INFO` |
| Security: dependencies | `npm audit` (`scripts/check-audit.mjs`) | `high` / `critical` in **production** dependencies, unless accepted in `audit-exceptions.json` | `low` / `moderate`, anything that only affects devDependencies, and accepted advisories until their expiry date |
| Security: secrets | gitleaks (full git history) | Any secret found | – |
| Security: container | Trivy (image scan) | `HIGH` / `CRITICAL` **with a fix available** | Everything else (low/medium, or no fix yet) |
| Licenses | `scripts/check-licenses.mjs` | Strong copyleft / non-commercial: GPL, AGPL, SSPL, EUPL, CC-BY-NC | Weak copyleft (MPL, LGPL, EPL, CDDL) and unknown/custom licenses |

Run the checks locally with `npm run lint`, `npm run typecheck`, `npm test` (or `npm run test:coverage`), `npm run audit:check` and `npm run license:check`.

## Why this split?

**Rule of thumb: we block only on problems that are real, that we can fix, and that we would never want to ship. Everything else becomes a warning.** A gate that often fails for no good reason gets bypassed. A gate that never fails is useless.

### What stops the pipeline

- **Type errors and ESLint errors** usually mean the app is broken at runtime (for example, Nuxt page transitions break when a page has several root elements). `eval`, `new Function` and `v-html` are the classic ways XSS or code injection gets into a Vue app.
- **Failing tests** mean that known behaviour (login redirect by role, token handling, event status rules) broke. A test that fails for no reason should be fixed or deleted, never skipped in CI.
- **High/critical CVEs in production dependencies** end up in the image that users reach, so they are real attack surface. `npm audit fix` can usually fix them without breaking changes, so blocking is fair.
- **Secrets** cannot be taken back once pushed, even if the commit is deleted later. They have to be rotated. Blocking forces this to happen before deployment.
- **Strong copyleft licenses** (GPL/AGPL) could force us to publish our own source code, and AGPL covers network use too. That is a legal risk, not a question of code style. There is no gray area here, so we block.
- **Fixable HIGH/CRITICAL in the image**: rebuilding with an updated base image fixes these, so there is no reason to ship them.

### What only creates warnings

- **Code hygiene / style** (unused variables, `any`, attribute order, `console.log`) does not affect correctness or security. The existing codebase has about 250 of these. Blocking on them would turn every PR red and push people toward `--no-verify` habits. They are shown as annotations and cleaned up step by step.
- **Deprecated APIs** (`process.client`) still work in Nuxt 4. They are a migration task, not a bug.
- **Low/moderate CVEs and devDependency CVEs**: devDependencies are not part of the production image (multi-stage Docker build), and low/moderate issues are rarely exploitable. They go to the backlog.
- **CVEs without a fix**: we cannot do anything about them right now. Blocking would stop all deployments until upstream releases a fix.
- **Weak copyleft (MPL-2.0 etc.)** only applies to the licensed files themselves. It is fine to use unmodified packages, but a human should look at them once. Today this is `lightningcss` (MPL-2.0, a build tool) and `only` (`MIT*`, a license text the tool can't detect).
- **Test coverage** is still low because the test suite is new. A threshold now would only measure how many tests were written so far. We report it so the trend is visible, and can add a ratchet later.
- **Semgrep WARNING/INFO** has a higher false-positive rate. A developer should review these findings, not the pipeline.

## Examples: what the gate caught on its first runs

- **Semgrep (blocking):** the container ran as `root` (`dockerfile.security.missing-user`). Fix: `USER node` in the Dockerfile.
- **Trivy (blocking):** 4 fixable HIGH CVEs (`tar`, `brace-expansion`, `ip-address`). They were not in our dependencies but in the npm CLI that ships with the `node:24-alpine` base image. The production container never runs npm, so we delete npm, npx, corepack and yarn from the final stage. That removes the finding and leaves less in the image to attack.
- **`npm ci` (blocking):** a lockfile generated on Windows was missing Linux-only optional dependencies (npm bug npm/cli#4828). Fix: regenerate the lockfile. The old Dockerfile used `npm install` as a fallback, which silently ignored the lockfile and hid this problem.

## npm audit exceptions

`nuxt` is a production dependency, so npm also counts Nuxt's dev and build tooling (CLI, devtools, Tailwind's file watcher) as "production". Some advisories in that tooling have no usable fix, and none of these packages end up in `.output/`, the only thing the Docker image contains. Blocking on them would stop every deployment without making the shipped app safer, which is the same reasoning as "CVEs without a fix" above.

Such advisories can be accepted in `audit-exceptions.json`:

```json
{ "id": "GHSA-…", "package": "…", "reason": "why it's not reachable / why there's no fix", "added": "YYYY-MM-DD", "expires": "YYYY-MM-DD" }
```

- Only add an entry when there is no usable fix **and** the package is not in `.output/` (check with `npm run build` and look in `.output/server/node_modules`).
- Use an expiry date of at most three months. After that the advisory blocks again and has to be re-checked.
- Advisories that aren't listed still block. Entries that are no longer needed show up as a notice in the job log.

Accepted on 2026-10-13: `node-forge` (via `listhen`, dev-server HTTPS), `braces` (via Tailwind's `chokidar`/`micromatch`), and `simple-git` + `@simple-git/argv-parser` (via `@nuxt/devtools`; the fix is in simple-git 4, which devtools 3.x can't load).

## Changing a threshold

- ESLint: change the rule severity in `eslint.config.mjs` (`'error'` or `'warn'`).
- Tests: add `coverage.thresholds` in `vitest.config.mjs` to make coverage blocking.
- Licenses: edit the `ALLOW` / `WARN` / `BLOCK` lists in `scripts/check-licenses.mjs`.
- npm audit: `BLOCKING` severities in `scripts/check-audit.mjs`, accepted advisories in `audit-exceptions.json`.
- Trivy / Semgrep: change the severity flags in the workflow files.
