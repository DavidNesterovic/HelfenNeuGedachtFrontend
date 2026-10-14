# CI/CD Pipeline

This doc gives an overview of the frontend pipeline and lists decisions that are still open. For what exactly stops the pipeline and what only warns, and the reasons, see [quality-gate.md](quality-gate.md).

## Flow

```mermaid
flowchart LR
    PR[Pull Request] --> QG
    Push[Push to master] --> QG
    Tag[Tag vX.Y.Z] --> QG
    subgraph QG[Quality Gate · quality-gate.yml]
        direction TB
        A[Static Code Analysis<br/>ESLint + typecheck]
        T[Unit Tests<br/>Vitest + coverage]
        B[SAST<br/>Semgrep]
        C[Dependencies<br/>npm audit]
        D[Secrets<br/>gitleaks]
        E[Licenses<br/>check-licenses.mjs]
    end
    QG -->|master or tag, all green| Build[docker build]
    Build --> Scan[Trivy image scan]
    Scan -->|no blocking findings| Ship[docker push<br/>master: latest + edge + sha-…<br/>tag: X.Y.Z + X.Y + latest]
    Ship -->|only for tags| Release[GitHub Release<br/>notes from git-cliff]
```

| Workflow | Trigger | Purpose |
|---|---|---|
| `quality-gate.yml` | Every pull request, manual, or called by `docker-publish.yml` | Runs the six checks in parallel. If any check fails, the gate fails. |
| `docker-publish.yml` ("Build & Release") | Push to `master`, push of a `v*` tag, manual | Runs the gate, then builds the image, scans it with Trivy and pushes it to GHCR. For tags it also creates the GitHub Release. See [release.md](release.md). |

The gate is a reusable workflow (`workflow_call`), so PRs and deployments always run the same checks.

**Runtime image:** built in two stages on `node:24-alpine`. The final image contains only `.output/`, runs as the unprivileged `node` user, and has no package managers (npm, npx, corepack, yarn).

## Running the checks locally

```bash
npm run lint          # ESLint (errors = blocking)
npm run typecheck     # vue-tsc
npm test              # Vitest (npm run test:coverage for the coverage report)
npm run license:check # license policy
npm run audit:check   # high/critical prod advisories, minus audit-exceptions.json
```

## Known pitfalls

- **Lockfile generated on Windows:** npm can leave out Linux-only optional dependencies (npm/cli#4828). If CI fails with `npm ci ... Missing: <pkg> from lock file`, regenerate the lockfile in Linux:
  ```bash
  docker run --rm -v "$PWD:/app" -w /app node:24 npm install --package-lock-only --ignore-scripts
  ```
  Do this after **every** `npm install`/`npm update` on Windows. On 2026-10-13 a Windows lockfile was missing `@emnapi/core` and `@emnapi/runtime`, and every job that runs `npm ci` failed.
- **Node version** is set in three places: `quality-gate.yml`, the `Dockerfile`, and your local machine. They must stay on the same major version (currently 24). `license-checker-rseidelsohn` requires Node 24 or newer.

## Open decisions

These are not implemented yet. Each one needs a team decision.

### Security and supply chain

1. **Pin versions to hashes.** `semgrep/semgrep` currently runs `latest`, and the GitHub Actions (`@v5`) and the Trivy and gitleaks images use tags that can be moved. Pinning to commit SHAs or image digests protects against a hijacked tag, but you then need Dependabot or Renovate to keep the pins up to date.
2. **Scheduled scans.** New CVEs appear without any change to our code. A weekly `schedule:` trigger on the gate plus a Trivy scan of the `latest` image would catch them. Decide who gets notified.
3. **Automatic dependency updates** (Dependabot or Renovate). Decide on grouping, how often they run, and whether patch updates can be merged automatically once the gate is green.
4. **Exceptions.** npm audit has them now: `audit-exceptions.json` lists accepted advisories with a reason and an expiry date, and an expired entry blocks again (see [quality-gate.md](quality-gate.md#npm-audit-exceptions)). Still open: the same for Trivy (`.trivyignore`) and Semgrep (`nosemgrep`), and who approves new entries.
5. **Registry credentials.** `GHCR_PAT` is one team member's personal token. If that person leaves or the token expires, deployment stops. Options: `GITHUB_TOKEN` with `packages: write`, if the image moves to the same account or an org, or a bot account.
6. **SBOM and signing.** Generate a software bill of materials (Trivy or Syft) and sign images with cosign, so the deployment side can verify where an image came from.
7. **Reporting.** Findings currently only appear in the logs and as annotations. Uploading SARIF to the GitHub Security tab needs a public repo or GitHub Advanced Security. If the repo is public, it's also worth considering CodeQL alongside Semgrep.

### Quality and thresholds

8. **Paying down warnings.** ESLint shows about 250 warnings today. Options:
   - a ratchet: a `--max-warnings` limit that only ever goes down
   - making individual rules blocking once they're cleaned up (good first candidates are `nuxt/prefer-import-meta` and `no-unused-vars`, since both can mostly be fixed with `--fix`)
9. **Tests.** Vitest unit tests (`test/`) now run in the gate: failing tests block, coverage is only reported. Still open:
   - a coverage threshold or ratchet (`coverage.thresholds` in `vitest.config.mjs`)
   - component tests for the `App*` primitives and modals
   - Playwright E2E smoke tests, with the API mocked through `page.route()` or the backend started as a container
10. **License policy details.** Is MPL-2.0 permanently acceptable? Should LGPL block, since it ends up bundled into the client JS? Who reviews "unknown" licenses such as `only` (`MIT*`)?
11. **Semgrep rulesets.** We currently use `p/javascript`, `p/typescript` and `p/owasp-top-ten`. Options include adding Vue-specific or custom rules for our API calls, or turning some WARNING rules into blocking ones if they rarely give false positives.

### Process and deployment

12. **Branch protection.** Require the gate as a status check on `master` and don't allow direct pushes. Today direct pushes are allowed; the gate still protects the deployment, but nobody reviews the code first.
13. **Versioning.** Done: semantic versioning from manual git tags, releases with generated notes, `latest` for every build from `master` (see [release.md](release.md)). Still open: enforcing conventional commit messages (e.g. commitlint in the gate), so the release notes need fewer entries under *Other*. The old `0.0.<run_number>` images stay on GHCR and could be cleaned up.
14. **Deployment.** The pipeline stops at `docker push`. It's still open whether and how deployment happens automatically (staging vs. production, manual approval via GitHub Environments).
15. **Runtime and cost.** Four jobs each run their own `npm ci`. That keeps them isolated but takes more minutes. We could share `node_modules` through a cache or an artifact if runtime becomes a problem.
16. **Backend repo.** Set up the same gate in the backend with .NET equivalents:
    - static analysis: `dotnet format --verify-no-changes` and the analyzers with `TreatWarningsAsErrors` for selected rules
    - security: `dotnet list package --vulnerable`
    - licenses: a NuGet license tool
    - unchanged: Semgrep, gitleaks and Trivy

    The blocking/warning thresholds should stay the same in both repos so the policy is consistent.
