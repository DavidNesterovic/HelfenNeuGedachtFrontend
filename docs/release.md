# Releases

A release is a git tag on `master`. Pushing the tag starts `.github/workflows/docker-publish.yml`, which runs the quality gate, builds and scans the Docker image, pushes it to GHCR and creates a GitHub Release with generated release notes. Nothing is released by hand.

## What a release produces

| Output | Where | Example for `v1.2.0` |
|---|---|---|
| **Version** | The git tag. It is the only source of the version number; `package.json` has none. | `v1.2.0` |
| **Artifact** | Docker image on GHCR, with OCI labels for version, commit and source repo | `ghcr.io/lgiselbrecht/helfenneugedacht.frontend:1.2.0`, `:1.2`, `:latest` |
| **Release** | GitHub Releases page of the repo | Release `v1.2.0` |
| **Release notes** | Body of the GitHub Release, generated from the commits since the previous tag by [git-cliff](https://git-cliff.org) (`cliff.toml`) | Sections *Features*, *Bug Fixes*, ..., *Other*, plus the `docker pull` command |

Pushes to `master` without a tag still build an image, but only as `edge` and `sha-<commit>`. So `latest` always means "the newest stable release", never a development state.

## Versioning (Semantic Versioning)

`vMAJOR.MINOR.PATCH`, for example `v0.3.1`:

- **PATCH** (`v0.3.0` → `v0.3.1`): bug fixes only.
- **MINOR** (`v0.3.1` → `v0.4.0`): new features, existing behaviour keeps working.
- **MAJOR** (`v0.4.0` → `v1.0.0`): breaking changes, e.g. the frontend now needs a newer backend API. `v1.0.0` is reserved for the first version considered production-ready.
- **Pre-release** (`v0.4.0-rc.1`): for testing before a release. It gets only the image tag `0.4.0-rc.1` (no `0.4`, no `latest`) and is marked as a pre-release on GitHub.

The workflow rejects tags that don't match `vX.Y.Z` / `vX.Y.Z-suffix`, and tags that point to a commit that isn't on `master`.

## Cutting a release

1. Make sure `master` is green in GitHub Actions.
2. Preview the release notes (commits since the last tag):
   ```bash
   npm run release:notes
   ```
   If commit messages are unclear, that's what the release notes will say. Conventional commit prefixes (`feat:`, `fix:`, `docs:`, `ci:`, `test:`, `refactor:`, `chore:`) decide the section; everything else lands under *Other*.
3. Create and push an annotated tag on the current `master`:
   ```bash
   git checkout master && git pull
   git tag -a v0.2.0 -m "v0.2.0"
   git push origin v0.2.0
   ```
4. Watch the **Build & Release** run in GitHub Actions. When it is green, the release is on the Releases page and the image is on GHCR.

## When something goes wrong

- **The gate or the build fails:** nothing has been pushed or released. Fix the problem on `master`, delete the tag (`git push origin :refs/tags/v0.2.0` and `git tag -d v0.2.0`) and tag the fixed commit again.
- **The image was pushed but the release step failed:** re-run the failed job in GitHub Actions. Pushing the same tags again is harmless.
- **A released version is broken:** don't move or reuse the tag. Release a fix as the next PATCH version (`v0.2.1`). To roll back a deployment, deploy the previous version's image tag (e.g. `:0.2.0`) instead of `latest`.
