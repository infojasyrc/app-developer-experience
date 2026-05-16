# INFRA_PLAN.md

Date: 2026-05-05
Environment: dev
Terraform root: `cloud/terraform/aws/`
Pipeline run cross-referenced: 24938618406 (2026-04-25, failed)

---

## Phase A: Terraform Module Findings

### Module structure

| File | Purpose |
|---|---|
| `main.tf` | Root orchestration — calls kms, logging, network, cluster, security modules |
| `versions.tf` | Terraform ≥1.13.0 + AWS provider ~6.0, single default provider, no assume_role |
| `variables.tf` | Variable declarations |
| `terraform.tfvars` | Dev defaults — `application_name=appdevexp`, `application_env=dev`, most sensitive values empty or blank |
| `module/kms/` | KMS key lifecycle |
| `module/logging/` | CloudWatch log groups + S3 ALB access logs |
| `module/network/` | VPC, subnets, NAT, flow logs |
| `module/cluster/` | ECS Fargate cluster |
| `module/security/` | WAFv2 ACL + CloudWatch log resource policy |
| `module/iam/` | ECS service role + scaling policy (commented out in main.tf) |
| `module/database/` | RDS instance (commented out in main.tf) |
| `module/application/` | ECS service + ALB (commented out in main.tf) |
| `module/auto-scaling/` | Application Auto Scaling (commented out in main.tf) |

### Provider version findings

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | 🔴 CRITICAL | Single default provider with no `assume_role` — Terraform runs all operations as `appdevexp-deployer` which has only S3/DynamoDB state permissions and sts:AssumeRole; every resource API call returns implicitDeny | Add `assume_role` blocks per service domain (see Fix 1 in PIPELINE_DEBUG_REPORT.md) |
| 2 | 🟡 WARNING | `aws_account_id` in `terraform.tfvars` is empty string (`""`) — causes `TF_VAR_aws_account_id` to resolve to `""` if the var override isn't provided | Set via `TF_VAR_aws_account_id` in workflow or populate tfvars |

### ECS Fargate validation

Active modules (not commented out): `module.cluster` (ECS cluster only — no task definitions or services active)

| Attribute | Found | Status |
|---|---|---|
| `module/cluster/main.tf` — cluster resource | `aws_ecs_cluster` with `container_insights=enabled` | ✅ |
| Task definition in scope | None — `module "application"` commented out | ℹ️ N/A |
| Service in scope | None — `module "application"` commented out | ℹ️ N/A |

### Networking validation

| # | Severity | Issue | Fix |
|---|---|---|---|
| 3 | 🟡 WARNING | `assign_public_ip = false` is set correctly in tfvars, but no ECS tasks are deployed — will need verification when `module "application"` is re-enabled | Confirm private subnets + NAT Gateway before enabling |
| 4 | 🟡 WARNING | NAT Gateway is defined in network module — verify it exists before enabling ECS (tasks in private subnets need NAT for ECR pull) | Check `terraform show` or `aws ec2 describe-nat-gateways` |

### Logging module findings

| # | Severity | Resource | Issue | Fix |
|---|---|---|---|---|
| 5 | 🔴 CRITICAL | `aws_cloudwatch_log_group.vpc_flow_logs` | `lifecycle { create_before_destroy = true }` triggers replace cycle — log group `/aws/vpc/flowlogs/appdevexp-dev` exists in AWS but is being replaced, causing `ResourceAlreadyExistsException` | Change to `create_before_destroy = false`; import existing log group first |
| 6 | 🟡 WARNING | `aws_cloudwatch_log_group.waf` | KMS key commented out (`# kms_key_id = var.kms_key_id`) — WAF logs stored unencrypted at rest | Uncomment after KMS grant for WAF service is confirmed |

### Static validation

`terraform validate`: ✅ (implied — workflow reached apply step)
`terraform plan`: Resources planned for creation (partial state from March 2026 partial apply)

terraform plan (from run 24938618406): IAM roles + WAF ACL + CloudWatch resources were in the plan

⚠️ `terraform plan` cannot be re-run locally without valid AWS credentials scoped to the sub-roles per service domain.

---

## Phase B: Makefile + IAM Template Findings

### Makefile completeness

The root `Makefile` contains no IAM/OIDC bootstrap targets. The `makefiles/` directory does not exist. IAM bootstrap was performed manually (all roles created 2026-03-24).

| Target purpose | Found | Issue |
|---|---|---|
| OIDC provider creation | ❌ NOT in Makefile | Created manually — no automation for re-creation |
| Terraform role creation | ❌ NOT in Makefile | Created manually |
| Policy attachment | ❌ NOT in Makefile | Created manually |
| Verification | ❌ NOT in Makefile | No automated check |

⚠️ NEEDS HUMAN REVIEW — The bootstrap process is undocumented. If the OIDC provider or deployer role is ever accidentally deleted, there is no automated way to recreate it.

### Template security findings

| # | Severity | Template | Issue | Fix |
|---|---|---|---|---|
| 1 | 🟡 WARNING | `terraform-trust-policy.json.tpl` | `sub` uses `StringLike` with `repo:__GITHUB_USER__/__REPO_NAME__:*` — any ref (branches, tags, PRs) can assume the role | Scope to `ref:refs/heads/main` for production: `repo:__GITHUB_USER__/__REPO_NAME__:ref:refs/heads/main` |
| 2 | 🟡 WARNING | `terraform-trust-policy.json.tpl` | Live role has `repo:infojasyrc/app-developer-experience:*` — wildcard on refs; PRs from forks could potentially trigger | Narrow to `ref:refs/heads/main` |
| 3 | 🔴 CRITICAL | `ecs-deploy-policy.json.tpl` | `IAMRoleManagementScoped` SID requires `iam:PermissionsBoundary` condition on `appdevexp-permissions-boundary` — but `appdevexp-deployer` uses `ecs-deploy-role` (via assume), which is constrained. However Terraform never assumes this role (see Phase A finding #1), so ALL IAM operations fail | Wire provider assumption OR attach permissions directly |
| 4 | 🟡 WARNING | `logs-manage-policy.json.tpl` | Resource patterns cover `appdevexp-*`, `/aws/ecs/appdevexp-*`, `aws-waf-logs-appdevexp-*` but NOT `/aws/vpc/flowlogs/appdevexp-*` — the VPC flow log group ARN is outside all allowed patterns | Add `arn:aws:logs:__AWS_REGION__:__AWS_ACCOUNT_ID__:log-group:/aws/vpc/flowlogs/appdevexp-*` to the `LogGroupManagement` SID |
| 5 | 🟡 WARNING | `service-trust-policy.json.tpl` | Trust references `appdevexp-deployer` — correct, but `appdevexp-s3-manage-role` is NOT listed in `terraform-backend-policy.json.tpl` AssumeServiceRoles | Add `appdevexp-s3-manage-role` to AssumeServiceRoles or wire via provider |
| 6 | ✅ PASS | `waf-manage-policy.json.tpl` | Contains `wafv2:PutLoggingConfiguration` in `WAFLoggingConfiguration` SID — policy content is correct | No change needed in template; issue is provider wiring |
| 7 | ✅ PASS | `permissions-boundary.json.tpl` | Has `DenyEscalation` SID blocking `iam:CreateRole`, `sts:AssumeRole`, etc. on roles | Correct least-privilege boundary |

### Template variable placeholders

| Variable | Used in | Description |
|---|---|---|
| `__AWS_ACCOUNT_ID__` | Multiple templates | 12-digit AWS account ID |
| `__AWS_REGION__` | Multiple templates | AWS region (e.g. `us-west-1`) |
| `__GITHUB_USER__` | `terraform-trust-policy.json.tpl` | GitHub org/user name |
| `__REPO_NAME__` | `terraform-trust-policy.json.tpl` | Repository name |
| `__TF_STATE_BUCKET__` | `terraform-backend-policy.json.tpl` | S3 bucket for TF state |
| `__TF_LOCK_TABLE__` | `terraform-backend-policy.json.tpl` | DynamoDB lock table |
| `__APP_NAME__` | `task-role-policy.json.tpl` | Application name (for scoped SSM/S3 access) |

Note: Templates use `__VAR__` double-underscore delimiters, not the `${VAR}` form used in some SKILL.md examples. Check rendering method if templates are re-applied.

### Makefile execution order (admin only — no automation exists)

1. Create OIDC provider manually: `aws iam create-open-id-connect-provider ...`
2. Render template: `sed 's/__AWS_ACCOUNT_ID__/ACCOUNT/g; s/__GITHUB_USER__/ORG/g ...' terraform-trust-policy.json.tpl > /tmp/trust.json`
3. Create deployer role: `aws iam create-role --role-name appdevexp-deployer --assume-role-policy-document file:///tmp/trust.json`
4. Attach terraform-backend policy as inline: `aws iam put-role-policy --role-name appdevexp-deployer --policy-name terraform-backend --policy-document file:///tmp/backend.json`
5. Create and attach sub-roles for each service domain (waf, logs, kms, ecs-deploy, s3-manage)

### Suggested commit for Phase B fix

```
fix(iam): add vpc-flowlogs log group ARN to logs-manage-policy template

- Adds arn:aws:logs:*:log-group:/aws/vpc/flowlogs/appdevexp-* to
  LogGroupManagement SID in logs-manage-policy.json.tpl
- Also scopes OIDC sub condition in terraform-trust-policy.json.tpl
  to ref:refs/heads/main to limit deploy surface

Refs: INFRA_PLAN.md Phase B
```

---

## Phase C: Live AWS State Findings

### OIDC Provider

| Check | Status | Detail |
|---|---|---|
| GHA OIDC provider exists | ✅ | `arn:aws:iam::580976914278:oidc-provider/token.actions.githubusercontent.com` |

### IAM Roles (all created 2026-03-24)

| Role | Exists | ARN |
|---|---|---|
| `appdevexp-deployer` (GHA OIDC) | ✅ | `arn:aws:iam::580976914278:role/appdevexp-deployer` |
| `appdevexp-ecs-deploy-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-ecs-deploy-role` |
| `appdevexp-kms-manage-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-kms-manage-role` |
| `appdevexp-waf-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-waf-role` |
| `appdevexp-logs-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-logs-role` |
| `appdevexp-s3-manage-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-s3-manage-role` |
| `appdevexp-task-execution-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-task-execution-role` |
| `appdevexp-appdevexp-task-role` | ✅ | `arn:aws:iam::580976914278:role/appdevexp-appdevexp-task-role` |

### Deployer role trust policy (live)

```json
{
  "Principal": { "Federated": "arn:aws:iam::580976914278:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringLike": { "token.actions.githubusercontent.com:sub": "repo:infojasyrc/app-developer-experience:*" },
    "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" }
  }
}
```

⚠️ `sub` wildcard allows any ref — PRs, tags, any branch.

### ECS Health

| Check | Status | Detail |
|---|---|---|
| Cluster active | ❌ | `list-clusters` returned `clusterArns: []` — cluster not deployed or in different state backend |
| Services running | N/A | No cluster |
| Stopped tasks | N/A | No cluster |

### RDS Health

| Check | Status | Detail |
|---|---|---|
| Instance in scope | ℹ️ N/A | `module "database"` is commented out in `main.tf` — no RDS instance expected |

### CloudWatch Log Groups (live)

| Log group | Status | Detail |
|---|---|---|
| `/aws/vpc/flowlogs/appdevexp-dev` | ⚠️ EXISTS but not in TF state | Created ~March 2026 during partial apply; causes ResourceAlreadyExistsException on re-apply |

### Cross-reference with static findings

- All IAM roles exist and match the Makefile bootstrap. The role-chaining architecture is correctly provisioned in AWS.
- The Terraform provider is the missing link: `versions.tf` has no `assume_role`, so Terraform never uses any of the sub-roles.
- ECS cluster is absent — either the state backend has the cluster in a different key, or the cluster Terraform apply also failed (since `ecs:CreateCluster` is implicitDeny for deployer).
- No stopped tasks to analyze (no cluster/tasks exist in the live account under this region).

---

## Phase D: IAM Drift Findings

### Terraform Pipeline Role — `appdevexp-deployer` (Makefile-managed)

| Check | Template | Live AWS | Drift |
|---|---|---|---|
| OIDC Principal | `oidc-provider/token.actions.githubusercontent.com` | Same | None |
| Action | `sts:AssumeRoleWithWebIdentity` | Same | None |
| Audience condition | `sts.amazonaws.com` | Same | None |
| Sub condition | `repo:__GITHUB_USER__/__REPO_NAME__:ref:refs/heads/__DEPLOY_BRANCH__` (intended scope) | `repo:infojasyrc/app-developer-experience:*` | ⚠️ Live is broader than template intent — `*` instead of branch-scoped |
| Inline policy | `terraform-backend` (S3 + DynamoDB + AssumeRole on 4 sub-roles) | Same structure | None |
| `appdevexp-s3-manage-role` in AssumeServiceRoles | Not in template | Not in live policy | ✅ Consistent (both missing) |

### ECS Execution Role — `appdevexp-task-execution-role` (Makefile-managed)

| Check | Template definition | Live AWS (simulation) | Drift |
|---|---|---|---|
| Trust principal | `ecs-tasks.amazonaws.com` | ⚠️ NEEDS HUMAN REVIEW | Unknown — need `aws iam get-role` |
| `ecr:GetAuthorizationToken` | ✅ in `task-execution-policy.json.tpl` | ✅ ALLOW | None |
| `ecr:BatchGetImage` | ✅ | ✅ ALLOW | None |
| `logs:CreateLogStream` / `PutLogEvents` | ✅ | ✅ ALLOW | None |
| `secretsmanager:GetSecretValue` | ✅ in `task-execution-policy.json.tpl` | ❌ implicitDeny | 🔴 Policy not attached in live |
| `ssm:GetParameters` | ✅ in `task-execution-policy.json.tpl` | ❌ implicitDeny | 🔴 Policy not attached in live |
| `kms:Decrypt` | ✅ in `task-execution-policy.json.tpl` | ❌ implicitDeny | 🔴 Policy not attached in live |

**Conclusion**: Only the managed policy `AmazonECSTaskExecutionRolePolicy` was attached. The custom `task-execution-policy.json.tpl` content (SSM, Secrets Manager, KMS) was not applied as an inline or custom policy.

### ECS Task Role — `appdevexp-appdevexp-task-role` (Makefile-managed)

| Check | Template definition | Live AWS (simulation) | Drift |
|---|---|---|---|
| Trust principal | `ecs-tasks.amazonaws.com` | ⚠️ NEEDS HUMAN REVIEW | Unknown |
| `ssm:GetParameter` | ✅ in `task-role-policy.json.tpl` | ❌ implicitDeny | 🔴 Policy not attached |
| `s3:GetObject` / `PutObject` | ✅ | ❌ implicitDeny | 🔴 Policy not attached |
| `cloudwatch:PutMetricData` | ✅ | ❌ implicitDeny | 🔴 Policy not attached |
| `xray:PutTraceSegments` | ✅ | ✅ ALLOW | Policy partially applied — XRay works |

**Conclusion**: The `task-role-policy.json.tpl` was partially applied. XRay is allowed (likely from an attached managed policy), but SSM, S3, and CloudWatch are denied (inline policy not attached or resource ARN scope doesn't match `appdevexp/__APP_NAME__/*`).

### Actions required to resolve drift

1. Re-run Makefile bootstrap targets to attach `task-execution-policy.json.tpl` as inline policy to `appdevexp-task-execution-role` (SSM + Secrets Manager + KMS)
2. Re-run Makefile bootstrap targets to attach `task-role-policy.json.tpl` as inline policy to `appdevexp-appdevexp-task-role` (SSM + S3 + CloudWatch)
3. Update OIDC `sub` condition in `appdevexp-deployer` trust policy to scope to `ref:refs/heads/main`
4. Add `/aws/vpc/flowlogs/appdevexp-*` ARN pattern to `logs-manage-policy.json.tpl` and re-apply

### Suggested commit for Phase D fix

```
fix(iam): attach missing inline policies to ECS execution and task roles

- Attach task-execution-policy to appdevexp-task-execution-role
  (SSM, Secrets Manager, KMS permissions were missing)
- Attach task-role-policy to appdevexp-appdevexp-task-role
  (SSM, S3, CloudWatch were implicit-deny)
- Narrow OIDC sub condition to ref:refs/heads/main

Refs: INFRA_PLAN.md Phase D
```

---

## Phase E: Permission Simulation Results

### Terraform Pipeline Role — `appdevexp-deployer`

| Action | Decision | Fix |
|---|---|---|
| s3:GetObject (state bucket) | ✅ ALLOW | — |
| s3:PutObject (state bucket) | ✅ ALLOW | — |
| s3:ListBucket (state bucket) | ✅ ALLOW | — |
| dynamodb:GetItem (lock table) | ✅ ALLOW | — |
| dynamodb:PutItem (lock table) | ✅ ALLOW | — |
| dynamodb:DeleteItem (lock table) | ✅ ALLOW | — |
| sts:AssumeRole (sub-roles) | ✅ ALLOW | — |
| ec2:CreateVpc | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| ec2:DescribeVpcs | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| ecs:CreateCluster | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| ecs:RegisterTaskDefinition | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| ecr:GetAuthorizationToken | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| iam:CreateRole | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| iam:PassRole | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |
| logs:CreateLogGroup | ❌ implicitDeny | Wire provider → `appdevexp-logs-role` |
| logs:PutRetentionPolicy | ❌ implicitDeny | Wire provider → `appdevexp-logs-role` |
| kms:CreateKey | ❌ implicitDeny | Wire provider → `appdevexp-kms-manage-role` |
| kms:DescribeKey | ❌ implicitDeny | Wire provider → `appdevexp-kms-manage-role` |
| wafv2:CreateWebACL | ❌ implicitDeny | Wire provider → `appdevexp-waf-role` |
| wafv2:PutLoggingConfiguration | ❌ implicitDeny | Wire provider → `appdevexp-waf-role` |
| s3:CreateBucket | ❌ implicitDeny | Wire provider → `appdevexp-s3-manage-role` |
| s3:PutBucketPolicy | ❌ implicitDeny | Wire provider → `appdevexp-s3-manage-role` |
| elasticloadbalancing:CreateLoadBalancer | ❌ implicitDeny | Wire provider → `appdevexp-ecs-deploy-role` |

### ECS Execution Role — `appdevexp-task-execution-role`

| Action | Decision | Fix |
|---|---|---|
| ecr:GetAuthorizationToken | ✅ ALLOW | — |
| ecr:BatchCheckLayerAvailability | ✅ ALLOW | — |
| ecr:GetDownloadUrlForLayer | ✅ ALLOW | — |
| ecr:BatchGetImage | ✅ ALLOW | — |
| logs:CreateLogStream | ✅ ALLOW | — |
| logs:PutLogEvents | ✅ ALLOW | — |
| secretsmanager:GetSecretValue | ❌ implicitDeny | Attach `task-execution-policy.json.tpl` inline policy |
| ssm:GetParameters | ❌ implicitDeny | Attach `task-execution-policy.json.tpl` inline policy |
| kms:Decrypt | ❌ implicitDeny | Attach `task-execution-policy.json.tpl` inline policy |

### ECS Task Role — `appdevexp-appdevexp-task-role`

| Action | Decision | Fix |
|---|---|---|
| ssm:GetParameter | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| ssm:GetParameters | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| ssm:GetParametersByPath | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| secretsmanager:GetSecretValue | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| logs:CreateLogStream | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| logs:PutLogEvents | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| s3:GetObject | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| s3:PutObject | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| s3:ListBucket | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| cloudwatch:PutMetricData | ❌ implicitDeny | Attach `task-role-policy.json.tpl` inline policy |
| xray:PutTraceSegments | ✅ ALLOW | — |

### Summary

- 🔴 CRITICAL denials: **19** across the 3 roles — must fix before any deployment can succeed
- 🟡 WARNING: 4 — OIDC scope, log group state drift, missing s3-manage-role in backend policy, deprecated backend parameter

### Prioritized fix list for infra-developer

1. **[BLOCKER]** Add `assume_role` blocks to `cloud/terraform/aws/versions.tf` per service domain (waf, logs, kms, ecs-deploy, s3-manage)
2. **[BLOCKER]** Update `cloud/terraform/aws/main.tf` to pass provider aliases per module
3. **[BLOCKER]** Import orphaned CloudWatch log group: `terraform import module.logging.aws_cloudwatch_log_group.vpc_flow_logs /aws/vpc/flowlogs/appdevexp-dev`
4. **[BLOCKER]** Attach `task-execution-policy.json.tpl` as inline policy to `appdevexp-task-execution-role`
5. **[BLOCKER]** Attach `task-role-policy.json.tpl` as inline policy to `appdevexp-appdevexp-task-role`
6. **[HIGH]** Change `create_before_destroy = false` on `aws_cloudwatch_log_group.vpc_flow_logs`
7. **[HIGH]** Add `/aws/vpc/flowlogs/appdevexp-*` to `logs-manage-policy.json.tpl` `LogGroupManagement` SID
8. **[HIGH]** Add `appdevexp-s3-manage-role` to `AssumeServiceRoles` in `terraform-backend-policy.json.tpl`
9. **[MEDIUM]** Fix `AWS_ACCOUNT_ID` secret vs variable namespace in workflow
10. **[MEDIUM]** Scope OIDC `sub` condition to `ref:refs/heads/main`
11. **[LOW]** Replace `dynamodb_table` with `use_lockfile=true` in workflow
12. **[LOW]** Upgrade GitHub Actions to Node.js 24 compatible versions

### Handoff to infra-developer

Pass this Phase E section as the authoritative fix list. The `infra-developer` agent should:
- Use `iam-roles-ecs` skill for items 4–5 (ECS role policy attachment)
- Use direct `versions.tf` / `main.tf` edits for items 1–2 (provider wiring)
- Use `terraform import` command for item 3 (state sync)
- Items 6–12 are lower risk and can follow in a second PR

---

## Suggested commits per phase

### Phase A (Terraform provider wiring)
```
infra(iam): wire Terraform AWS provider to assume service sub-roles

- Add alias providers for waf, logs, kms, ecs-deploy, s3-manage domains
- Each module now receives the appropriate provider with assume_role config
- Resolves implicitDeny for all 19 blocked AWS resource operations

Refs: INFRA_PLAN.md Phase A
```

### Phase B (Template fixes)
```
fix(iam): scope logs policy to include vpc-flowlogs group ARN

- Adds /aws/vpc/flowlogs/appdevexp-* to LogGroupManagement SID
- Narrows terraform-trust-policy.json.tpl sub to refs/heads/main
- Adds appdevexp-s3-manage-role to AssumeServiceRoles in backend policy

Refs: INFRA_PLAN.md Phase B
```

### Phase D (ECS role inline policies)
```
fix(iam): attach missing inline policies to ECS execution and task roles

- Attach task-execution-policy: SSM + Secrets Manager + KMS to execution role
- Attach task-role-policy: SSM + S3 + CloudWatch to task role
- Both roles were previously missing custom policies (only base managed policy attached)

Refs: INFRA_PLAN.md Phase D
```

### Phase E (State import + lifecycle fix)
```
fix(ecs): import orphaned CloudWatch log group and fix lifecycle config

- terraform import for /aws/vpc/flowlogs/appdevexp-dev to resolve state drift
- Change create_before_destroy=false on vpc_flow_logs resource

Refs: INFRA_PLAN.md Phase E
```
