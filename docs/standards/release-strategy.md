# Release Strategy

How and when releases are cut across ADE components (Conference Manager,
backend templates, mobile templates, DevOps pipelines).

> Only **backend templates** are decided so far (below). Other components:
> TODO, team to decide. Related: [versioning.md](./versioning.md),
> [changelog.md](./changelog.md).

---

## Backend templates

Applies to `backend/fastapi-rest-tpl`, `backend/nestjs-rest-tpl` and
`backend/nestjs-gql-tpl`.

| Rule | Detail |
|---|---|
| Releases are **tag-only** | `.github/workflows/release.yml` tags the merge commit `<tpl>-vX.Y.Z` and publishes a GitHub release. It never pushes commits to `main` (the `main` ruleset requires a PR) |
| Tags are the source of truth | The next version comes from the latest `<tpl>-v*` tag. `package.json` / `pyproject.toml` in the repo is only the starting version used before a template's first tag; the released bundle carries the real version |
| The GitHub release notes are the changelog | Notes contain only the commits under `backend/<tpl>/` since the previous tag, with a header that matches the release version. `backend/<tpl>/CHANGELOG.md` is no longer updated by the bot |
| Bump rules | Over the commits that touched `backend/<tpl>/` since the last tag: a `!` after the type or a `BREAKING CHANGE:` footer → **major**; any `feat` → **minor**; anything else → **patch** ([commit-types.md](./commit-types.md)) |
| Assets | `<tag>.tar.gz`, `<tag>.zip` and a `.sha256` file for each. Only git-tracked files of the template, with the template contents at the archive root (no `node_modules`, `.venv`, `coverage`) |
| Forcing a release | `workflow_dispatch` with the `packages` input (see step 3) |

### How to release a backend template — step by step

1. **Check what will be released.** Commits under `backend/<tpl>/` must follow
   [Conventional Commits](./commit-types.md); the type decides the bump.
   Preview the content and the bump:

   ```bash
   LAST=$(git tag --list '<tpl>-v*' --sort=-v:refname | head -n 1)
   git log --oneline "$LAST"..origin/main -- backend/<tpl>
   ```

   Watch the squash-merge title of the PR: it becomes the commit subject the
   pipeline reads. Don't write `!` or `BREAKING CHANGE:` unless the
   **template** has a breaking change; a breaking change elsewhere in the
   same PR would still major-bump every template the PR touches.

2. **Automatic release.** Merge a PR that changes anything under
   `backend/<tpl>/` into `main`. `release.yml` detects the package key and runs
   the matching job:

   | Template | Package key | Job |
   |---|---|---|
   | `fastapi-rest-tpl` | `tpl-fastapi-rest` | `release-fastapi-rest-tpl` |
   | `nestjs-rest-tpl` | `tpl-nestjs-rest` | `release-nestjs-rest-tpl` |
   | `nestjs-gql-tpl` | `tpl-nestjs-gql` | `release-nestjs-gql-tpl` |

3. **Manual / forced release** (first release of a template, or a release
   after a failed run). Use the GitHub UI: **Actions → Release & Changelog
   pipeline → Run workflow**, branch `main`, and put space-separated keys in
   `packages`. Or use the CLI:

   ```bash
   gh workflow run release.yml --ref main -f packages="tpl-fastapi-rest tpl-nestjs-gql"
   ```

   If no commits touched the template since its last tag, the job succeeds
   without releasing anything.

4. **Follow the run.**

   ```bash
   gh run watch "$(gh run list --workflow release.yml --limit 1 --json databaseId -q '.[0].databaseId')"
   ```

   The job summary lists the previous tag, the bump and the new tag.

5. **Verify the release.**

   ```bash
   gh release view <tpl>-vX.Y.Z           # title version == notes header version
   gh release download <tpl>-vX.Y.Z -p '*.tar.gz*' -D /tmp/<tpl>
   cd /tmp/<tpl> && shasum -a 256 -c <tpl>-vX.Y.Z.tar.gz.sha256
   ```

6. **Consume the template.** The repository is public, so no token is needed:

   ```bash
   mkdir orders-api && cd orders-api
   curl -fsSL https://github.com/infojasyrc/app-developer-experience/releases/download/<tpl>-vX.Y.Z/<tpl>-vX.Y.Z.tar.gz | tar -xz
   make help
   ```

   Then rename the template identity and follow the template README
   (Make targets only, no host `npm` / `python`).

7. **Roll back a bad release.** Delete the release and its tag, then fix the
   template in a new PR. The next run computes the version from the previous
   tag again.

   ```bash
   gh release delete <tpl>-vX.Y.Z --cleanup-tag --yes
   ```

8. **Add a new template to the pipeline.**
   - Register its path and key in `.github/actions/get-changed-packages/get-changed-packages.sh`.
   - Add a `release-<tpl>` job to `.github/workflows/release.yml` that calls
     `./.github/actions/generate-release-changelog` with `working-directory`
     and `project-name` (the tag prefix).
   - Add the key to the `packages` input description.
