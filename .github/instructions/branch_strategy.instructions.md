# Branch Strategy Instructions

This document defines the branching strategy used in this monorepo and how it integrates with CI/CD workflows.

## Branch Strategy Overview

### Main Branch
- **`main`**: Production-ready code. All feature/fix branches create PRs targeting `main`.
- No direct commits to `main`; all changes go through pull requests.

### Feature/Fix Branches
Branches follow a **component-based naming convention**:

```
{component}/{conventional-commit-type}
```

#### Examples:
- `conference-api/feat` – New feature for Conference API
- `conference-api/fix` – Bug fix for Conference API
- `conference-webapp/feat` – New feature for Conference Webapp
- `conference-webapp/fix` – Bug fix for Conference Webapp
- `conference-admin/refactor` – Refactoring for Conference Admin
- `fastapi-rest-tpl/feat` – New feature in backend template: fastapi-rest-tpl
- `nestjs-rest-tpl/fix` – Bug fix in backend template: nestjs-rest-tpl

#### Supported Conventional Commit Types:
- `feat` – New feature
- `fix` – Bug fix
- `refactor` – Code refactoring
- `hotfix` – Critical production fix
- `docs` – Documentation updates
- `test` – Test-related changes

## Pull Request Workflow

### Creating a PR
1. Create a feature branch from `main` following the naming convention
2. Push commits using conventional commit format (already enforced by commitlint)
3. Open a PR targeting `main` (base branch)
4. GitHub Actions automatically triggers `pull_request_conference_manager.yml` workflow

### Workflow Execution

The workflow (`pull_request_conference_manager.yml`) operates as follows:

#### 1. **Get list of changed packages** (always runs)
- Detects which components were modified in the PR
- Uses `get-changed-packages` composite action
- Outputs a list of changed packages (e.g., `conference-manager/ms-conference-api`)

#### 2. **Component-specific verification jobs** (conditional)
Each job runs only if its component was changed:

| Job | Condition | Runs When |
|-----|-----------|-----------|
| `conference-webapp-verify` | Changes in `conference-manager/ms-conference-webapp` AND branch matches pattern | PR modifies webapp files |
| `conference-api-verify` | Changes in `conference-manager/ms-conference-api` AND branch matches pattern | PR modifies API files |
| `conference-admin-verify` | Changes in `conference-manager/ms-conference-admin` AND branch matches pattern | PR modifies admin files |

#### 3. **Branch Name Filtering**
Each job also checks `github.head_ref` to ensure the branch follows the component-based naming:

```yaml
if: startsWith(github.head_ref, 'conference-api/feat/') || 
    startsWith(github.head_ref, 'conference-api/fix/') || 
    startsWith(github.head_ref, 'conference-api/hotfix/') || 
    startsWith(github.head_ref, 'conference-api/refactor/')
```

This ensures:
- Only feature/fix/refactor branches trigger CI
- Branch name aligns with the component being modified
- Optimizes CI resources by skipping no feature branches

## Changed Packages Detection

The `get-changed-packages` action uses fallback logic to detect changes:

1. **Primary (GitHub Actions)**: `git diff HEAD^ HEAD`
   - Works in real GitHub Actions with full git history

2. **Secondary (Local git)**: `git status --porcelain`
   - Works when testing locally with uncommitted changes

3. **Tertiary (Hardcoded fallback)**: Uses `GITHUB_HEAD_REF` environment variable
   - Maps branch name to component for testing with `act`
   - Example: `conference-api/feat` → `conference-manager/ms-conference-api`

## Testing Workflows Locally with `act`

### Event Simulation File
Use `devops/tests/events_simulate_pull_request_conference_api.json` to test the workflow:

```json
{
  "action": "opened",
  "number": 1,
  "pull_request": {
    "head": {
      "ref": "conference-api/feat",
      "sha": "1111111111111111111111111111111111111111"
    },
    "base": {
      "ref": "main"
    }
  },
  "repository": {
    "full_name": "app-developer-experience"
  }
}
```

Key fields:
- `head.ref`: Feature branch name (must match component naming convention)
- `base.ref`: Always `main`
- `action`: Should be `"opened"` to simulate a new PR

### Running Tests
```bash
# Validate conference API verification job
make devops-gh-actions-conference-manager-api-verify

# Equivalent manual command
act pull_request -e devops/tests/events_simulate_pull_request_conference_api.json -j conference-api-verify
```

## Best Practices

### ✅ DO:
- Create branches from `main` only
- Use component-based naming: `{component}/{type}`, review pull_request_template.md for examples
- Use conventional commit messages in all commits
- Ensure branch name matches the component being changed
- Test locally with `act` before pushing
- Keep commits atomic and well-described

### ❌ DON'T:
- Push directly to `main`
- Use arbitrary branch names (e.g., `my-feature`, `bugfix`)
- Mix changes from multiple components in one PR (one component per PR)
- Commit to unrelated component branches
- Ignore failing CI checks before merging

## Common Scenarios

### Scenario 1: New Conference API Feature
```bash
# Branch name
conference-api/feat/add-new-endpoint

# Commits (conventional format)
git commit -m "feat(conference-api): add new endpoint"
git commit -m "test(conference-api): add tests for endpoint"

# PR targets: main
# Job triggered: conference-api-verify
# Job runs: make build-dev, make install-dependencies, make lint, make unit-tests, make build-prod
```

### Scenario 2: Webapp Bug Fix
```bash
# Branch name
conference-webapp/fix/resolve-layout-issue

# Commits
git commit -m "fix(conference-webapp): resolve layout issue"

# PR targets: main
# Job triggered: conference-webapp-verify
# Job runs: make build-dev, make install-dependencies, make lint, make unit-tests, make build-prod
```

### Scenario 3: Multiple Components (NOT ALLOWED)
❌ Creating a single PR that changes both API and Webapp files is discouraged.
✅ Instead, create separate PRs:
- `conference-api/feat/add-new-endpoint` → changes only `conference-manager/ms-conference-api`
- `conference-webapp/fix/resolve-layout-issue` → changes only `conference-manager/ms-conference-webapp`

## Related Files
- Workflow definition: [.github/workflows/pull_request_conference_manager.yml](../workflows/pull_request_conference_manager.yml)
- Changed packages action: [.github/actions/get-changed-packages/action.yml](../actions/get-changed-packages/action.yml)
- Event simulation: [devops/tests/events_simulate_pull_request_conference_api.json](../../devops/tests/events_simulate_pull_request_conference_api.json)
- Makefile targets: [Makefile](../../Makefile) (search for `devops-*` targets)
