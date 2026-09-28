# Quality Gate

Every pull request runs `.github/workflows/quality-gate.yml`. On `master`, `docker-publish.yml` runs the same gate first and only builds and pushes the image if the gate passes. After the build, the image itself is scanned before `docker push`.

## Overview

| Area | Tool | **Stops the pipeline** | **Warning only** |
|---|---|---|---|
| Static analysis | ESLint (`@nuxt/eslint`) | Rules at `error`: Vue/Nuxt correctness (e.g. a page with more than one root element), `no-eval`, `no-new-func`, `vue/no-v-html`, `debugger` | Rules at `warn`: unused variables, `any`, `console.log`, empty blocks, deprecated `process.client`, formatting and attribute order |
| Static analysis | `nuxt typecheck` (vue-tsc) | Any type error | – |
| Security: code (SAST) | Semgrep (`p/javascript`, `p/typescript`, `p/owasp-top-ten`) | Findings with severity `ERROR` | Findings with severity `WARNING` / `INFO` |
| Security: dependencies | `npm audit` | `high` / `critical` in **production** dependencies | `low` / `moderate`, and anything that only affects devDependencies |
| Security: secrets | gitleaks (full git history) | Any secret found | – |
| Security: container | Trivy (image scan) | `HIGH` / `CRITICAL` **with a fix available** | Everything else (low/medium, or no fix yet) |
| Licenses | `scripts/check-licenses.mjs` | Strong copyleft / non-commercial: GPL, AGPL, SSPL, EUPL, CC-BY-NC | Weak copyleft (MPL, LGPL, EPL, CDDL) and unknown/custom licenses |

Run the checks locally with `npm run lint`, `npm run typecheck` and `npm run license:check`.

## Why this split?

**Rule of thumb: we block only on problems that are real, that we can fix, and that we would never want to ship. Everything else becomes a warning.** A gate that often fails for no good reason gets bypassed. A gate that never fails is useless.

### What stops the pipeline

- **Type errors and ESLint errors** usually mean the app is broken at runtime (for example, Nuxt page transitions break when a page has several root elements). `eval`, `new Function` and `v-html` are the classic ways XSS or code injection gets into a Vue app.
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
- **Semgrep WARNING/INFO** has a higher false-positive rate. A developer should review these findings, not the pipeline.

## Changing a threshold

- ESLint: change the rule severity in `eslint.config.mjs` (`'error'` or `'warn'`).
- Licenses: edit the `ALLOW` / `WARN` / `BLOCK` lists in `scripts/check-licenses.mjs`.
- Audit / Trivy / Semgrep: change the severity flags in the workflow files.
