---
applyTo: "**/Makefile, **/makefiles/*.mk, **/*.mk"
---
# Project conventions for Makefiles & CLI Task Targets

These guidelines standardize naming for CRUD and operational targets across infrastructure, backend services, and tooling (e.g., ECR, Docker, Terraform wrappers). Apply when introducing or refactoring Make targets.

## 1. General Naming Pattern
- Use lowercase, hyphen-separated target names: `component-verb[-qualifier]`.
- Start with a stable component prefix (e.g., `ecr`, `db`, `api`, `web`, `infra`, `tf`).
- Follow with an action verb from the approved set.
- Optionally add a qualifier for scope or mode: `-frontend`, `-backend`, `-custom`, `-local`, `-all`.
- Keep target names short (< 30 chars) but explicit.

Pattern formula:
```
<component>-<action>[-<qualifier>]
```
Examples:
```
ecr-create-frontend
ecr-delete-custom
db-migrate
db-seed-integration
tf-plan-infra
tf-apply-infra
docker-build-api
docker-push-web
```

## 2. Approved Action Verbs
CRUD baseline plus operational lifecycle verbs:
- Create: `create`
- Read/List/Show: `list`, `print`, `show`
- Update/Replace: `update`, `sync`, `rebuild`
- Delete/Remove: `delete`, `remove`, `destroy` (prefer `delete` for repos, `destroy` for infra)
- Build/Compile: `build`
- Test/Validate: `test`, `lint`, `validate`, `audit`
- Deploy/Run: `deploy`, `launch`, `start`, `stop`, `restart`
- Auth/Access: `login`, `logout`
- Generate: `gen`, `scaffold`
- Inspect: `info`, `status`
- Package: `package`

Choose the most semantically precise verb; avoid synonyms that fragment usage (`rm`, `del`, `remove`—prefer `delete` unless POSIX alignment is critical).

## 3. Target Groups & Namespacing
When many targets share a component prefix:
- Group related help via a meta target: `<component>-help` that prints available subcommands.
- Use consistent ordering in help output: lifecycle (create → list → update → delete) → build/deploy → diagnostics.

Example help target:
```
ecr-help:
	@echo "ECR Targets:" && echo "  ecr-create-frontend" && echo "  ecr-create-backend" && echo "  ecr-create-custom NAME=<repo>" && echo "  ecr-delete-frontend" && echo "  ecr-delete-backend" && echo "  ecr-delete-custom NAME=<repo>" && echo "  ecr-print-values" && echo "  ecr-login"
```

## 4. Interactive Targets
- Append `-custom` or `-interactive` to indicate prompted input (e.g., `ecr-create-custom`).
- Support non-interactive usage via variable override (`NAME=my-repo`).
- Document usage inline in the comment after `##`.

## 5. Deprecated Targets
- Retain old names as thin aliases for one release cycle.
- Mark with `(DEPRECATED)` and forward internally:
```
old-target:
	@$(MAKE) new-target
```
- Remove when documented sunset passes.

## 6. Comments & Help Strings
- Use `##` after target definition line to provide a concise description. This enables automatic discovery via `awk`/`grep` tooling.
- Emoji optional; if used, choose one consistent per domain (e.g., 🐳 for container/ECR, ☁️ for cloud, 🛠️ for build).
- Keep description ≤ 100 chars and start with a verb.

Example:
```
ecr-create-backend: ## 🐳 Create (if missing) the Backend ECR repository (ADMIN)
```

## 7. Variables
- Use uppercase snake case for variables: `AWS_REGION`, `CUSTOM_REPO_NAME`.
- Provide safe defaults with `?=` only when non-sensitive.
- Never echo secrets; mask or omit.
- For optional interactive input, allow override precedence: CLI var → default var → prompt.

Interactive pattern:
```
@bash -c 'VALUE=$${VALUE:-$(DEFAULT)}; if [ -z "$$VALUE" ]; then read -p "Enter VALUE: " VALUE; fi; ...'
```

## 8. Idempotency & Safety
- `create` targets must check existence before creation (`describe-*` or test path).
- `delete` targets should warn about destructive impact; prefer `--force` only when documented.
- Consider `confirm` prompt for irreversible infra deletes; allow bypass via `YES=1`.

Deletion pattern:
```
@if [ -z "$$YES" ]; then read -p "Type YES to confirm deleting <resource>: " CONF; [ "$$CONF" = "YES" ] || (echo "Abort"; exit 1); fi
```

## 9. Output Conventions
- Success line should start with `✅` and resource identifier.
- Errors should exit non-zero; rely on underlying CLI exit codes or add `|| exit 1`.
- For print/list targets, output in `key = "value"` Terraform-friendly format when relevant.

## 10. Phasing & Lifecycle Targets
For multi-stage flows (e.g., infra):
- `tf-plan-infra` (dry-run)
- `tf-apply-infra` (change)
- `tf-destroy-infra` (teardown)
Keep symmetrical naming.

## 11. Discovery Automation (Optional)
Add a root `make help` pattern:
```
help: ## List top-level make targets
	@grep -hE '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | awk -F':|##' '{printf "%-30s %s\n", $1, $3}' | sort
```

## 12. Avoid Common Pitfalls
- Do not mix tabs/spaces: use a single tab for command indentation.
- Avoid silent failures; echo explanatory messages.
- Keep shell logic readable; use `bash -c` only for multi-line/interactive flows.
- Refrain from exporting environment variables globally in Makefile; pass inline when needed.

## 13. Review Checklist Before Adding Target
- Prefix matches component domain.
- Verb aligns with approved list.
- Idempotent (create/list) or safely destructive (delete with warning).
- Comment present with `##` description.
- Variables validated or prompted.
- Output includes clear success indicator.
- Aliases (if any) marked deprecated.

## 14. Example Complete Target Set (ECR)
```
ecr-create-frontend: ## 🐳 Create (if missing) the Frontend ECR repository (ADMIN)
ecr-create-backend:  ## 🐳 Create (if missing) the Backend ECR repository (ADMIN)
ecr-create-custom:   ## 🐳 Interactively create a custom ECR repository (ADMIN). Usage: make ecr-create-custom NAME=my-repo
ecr-delete-frontend: ## ❌ Delete the Frontend ECR repository (DANGEROUS, ADMIN)
ecr-delete-backend:  ## ❌ Delete the Backend ECR repository (DANGEROUS, ADMIN)
ecr-delete-custom:   ## ❌ Interactively delete a custom ECR repository (DANGEROUS). Usage: make ecr-delete-custom NAME=my-repo
ecr-print-values:    ## 🔎 Print repository URIs for terraform.tfvars
ecr-login:           ## 🔐 Docker login to ECR
```

Adhere strictly to these conventions to maintain consistency and ease of automation across the monorepo.
