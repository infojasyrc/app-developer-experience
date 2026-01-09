# DevOps

## Pipelines

- pull_request_cm_components.yml: will verify lint/unit-tests for conference manager components
- pull_request_cm_infrastructure.yml: will verify lint/plan for conference manager infrastructure
- pull_request_backend: will verify lint/unit-tests for backend templates
- ci_cm_components: will build, deploy and trace container images to aws
- validate_commits: will verify using conventional commits