# Branch Naming

Branch strategy: trunk-based development. Each developer creates a feature
branch off `main` using the following pattern:

```
component/user/type/task-name
```

`component` should match one the component related to this project [pull request template](../../.github/pull_request_template.md)
`type` should match one of the [commit types](./commit-types.md).

Examples:
- `cm-api/jose/feat/add-team-agreements-in-docs`
- `nestjs-rest-tpl/jose/feat/new-healthcheck-endpoint`
- `cicd/feat/new-job-in-pull-request-workflow`
