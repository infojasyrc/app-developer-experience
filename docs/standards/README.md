# Team & Platform Standards

Shared process and convention standards for every component in this monorepo —
Conference Manager, backend service templates, mobile app templates, DevOps
pipelines, and cloud infrastructure. These are team agreements, not architecture decisions.

## Format

One Markdown file per standard in this directory. Every component README
links here instead of duplicating the content.

## Index

| Standard | File | Covers |
|---|---|---|
| Commit types | [commit-types.md](./commit-types.md) | Conventional Commits type list, message format, how to choose a type |
| Branching | [branching.md](./branching.md) | Trunk-based branch naming convention |
| Pull requests | [pull-requests.md](./pull-requests.md) | PR structure, work-in-progress, automation |
| Release strategy | [release-strategy.md](./release-strategy.md) | How and when releases are cut (TODO) |
| Versioning | [versioning.md](./versioning.md) | SemVer application across components (TODO) |
| Changelog | [changelog.md](./changelog.md) | Changelog generation and format (TODO) |

## Change protocol

If a standard changes:
1. Update the file in this directory only — never re-copy content into a component README.
2. Every component README should link to the file, not embed its content.
3. AI agents read [`agents/shared/context/commit-conventions.md`](../../agents/shared/context/commit-conventions.md) for agent-specific extensions to these standards.
