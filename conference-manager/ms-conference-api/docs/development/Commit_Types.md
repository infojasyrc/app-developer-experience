# Commit Types

Team guide for writing commit messages in this service. Messages follow
[Conventional Commits 1.0](https://www.conventionalcommits.org/) and are
validated by the `commit-msg` hook (`yarn commitlint`). A message that does
not match this format will be rejected.

## Message format

```
<type>(<optional-scope>): <description>
```

| Part | Required | Rules |
| --- | --- | --- |
| `type` | Yes | One of the allowed types below. Lowercase. |
| `scope` | No | Area of the change (`events`, `auth`, `users`). Lowercase. |
| `description` | Yes | Imperative present tense (`add`, `fix`, `reject`), not past (`added`, `fixed`) and not gerund (`adding`, `fixing`). No period at the end. The full subject line is max 72 characters. |

The description completes this sentence: **If applied, this commit will** `<description>`.

| Use | Avoid |
| --- | --- |
| `feat: add pagination to the events list` | `feat: added pagination to the events list` |
| `fix: reject expired Firebase tokens` | `fix: rejecting expired Firebase tokens` |

Use the body for **what** and **why**, not how:

```
feat: add pagination to the events list

The unpaginated endpoint timed out on conferences with thousands of
sessions. Clients now request pages of 20 items by default.
```

## Allowed types

Use this table as a lookup when writing a commit. If two types seem to fit,
pick the one that describes the **user-visible outcome**, not the files you
touched.

| Type | When to use | Example |
| --- | --- | --- |
| `feat` | New behaviour or capability. Correlates with **MINOR** in [SemVer](https://semver.org/). | `feat: add endpoint to publish a conference` |
| `fix` | Bug fix or incorrect behaviour. Correlates with **PATCH** in SemVer. | `fix: reject expired Firebase tokens` |
| `build` | Build system, packaging, or dependency versions (npm, Docker, Yarn). | `build: upgrade mongodb driver to 6.9` |
| `ci` | CI/CD config or scripts (GitHub Actions, Makefile targets used in pipelines). | `ci: add lint job to the pull request workflow` |
| `docs` | Documentation only. No production code change. | `docs: document local Unleash setup` |
| `perf` | Change whose purpose is better performance, with the same behaviour. | `perf: index headquarters by city for list queries` |
| `refactor` | Restructure code without changing behaviour, fixing a bug, or adding a feature. | `refactor: extract token validation into a provider` |
| `style` | Formatting only. No meaning change (whitespace, semicolons, Prettier). | `style: apply prettier to event controllers` |
| `test` | Add, correct, or skip tests. No production code change. | `test: cover pagination query params` |
| `chore` | Maintenance that is not `build`, `ci`, `docs`, or `test` (ignore files, repo housekeeping). | `chore: ignore local Unleash dumps in gitignore` |
| `revert` | Undo a previous commit. Reference the original hash in the description. | `revert: revert feat(events) a1s2d3f` |

## How to choose a type

Walk this list top to bottom and stop at the first match:

1. Does it restore previous behaviour? → `revert`
2. Does it fix incorrect behaviour? → `fix`
3. Does it add behaviour a user or consumer can notice? → `feat`
4. Does it only change docs? → `docs`
5. Does it only change tests? → `test`
6. Does it only change CI/CD? → `ci`
7. Does it only change build tooling or dependency versions? → `build`
8. Is the goal faster execution with the same result? → `perf`
9. Is it formatting with no logic change? → `style`
10. Is it a restructure with no behaviour change? → `refactor`
11. Otherwise → `chore`

Do not use `feat` for refactors, dependency bumps, or CI changes. Do not use
`fix` for work that was never broken in production (use `refactor`, `chore`,
or `test` instead).

## Types that are not allowed

| Type | Why it is rejected |
| --- | --- |
| `wip` | Not in Conventional Commits. The hook will reject it. Keep unfinished work in a branch or draft pull request. |
| Any other label (`update`, `changes`, `misc`, …) | Only the types in the table above pass `commitlint`. |

## Breaking changes

If other developers or API consumers must take action after this commit, mark
it as breaking. That correlates with **MAJOR** in SemVer.

```
feat: require conferenceId on session create

BREAKING CHANGE: POST /v1/sessions without conferenceId now returns 400.
Clients must send conferenceId in the body before merging this change.
```
