---
description: Debug the latest failed GitHub Actions workflow
---

Read `agents/shared/context/monorepo-paths.md` first.
Then act as `pipeline-debugger` using the `gha-debugger` skill:

1. Run `gh run list --status failure --limit 5`
...