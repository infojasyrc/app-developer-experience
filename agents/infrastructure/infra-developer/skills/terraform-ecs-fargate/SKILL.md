---
name: terraform-ecs-fargate
description: >
  Implements Terraform fixes and extensions to this repo's actual
  module/ecs-app (webapp + API on ECS Fargate, dual ALB, EFS-backed Mongo
  sidecar) and related modules (module/network, module/cluster, module/efs).
  Use when the plan requires creating or fixing ECS task definitions, ECS
  services, security groups, or load balancers within module/ecs-app. Always
  reads monorepo-paths.md then INFRA_PLAN.md Phase A before writing any .tf
  file. Runs terraform validate after each change — never apply.
metadata:
  author: app-dev-exp
  version: "2.0"
---

# terraform-ecs-fargate

Implements Phase A of `INFRA_PLAN.md`: Terraform module fixes for
`cloud/terraform/aws/module/ecs-app/` (+ its dependencies: `module/network`,
`module/cluster`, `module/efs`). Paths resolved from
`agents/shared/context/monorepo-paths.md`.

---

## Before writing any file

```bash
# Always read paths first
cat agents/shared/context/monorepo-paths.md
# provider-alias chain — module/ecs-app runs under aws.ecs
cat agents/shared/context/aws-infrastructure-map.md
TERRAFORM_AWS="cloud/terraform/aws"
INFRA_PLANS="agents/infrastructure/plans"

# Read the plan
cat $INFRA_PLANS/INFRA_PLAN.md

# Understand existing module structure — this is the real layout, not a generic one
cat $TERRAFORM_AWS/module/ecs-app/main.tf $TERRAFORM_AWS/module/ecs-app/variables.tf $TERRAFORM_AWS/module/ecs-app/outputs.tf
cat $TERRAFORM_AWS/main.tf   # see how module.ecs_app is wired to module.iam / module.network / module.cluster

# Validate current state
cd $TERRAFORM_AWS && terraform validate
terraform plan 2>&1 | tail -30
```

---

## Real architecture: two services, two ALBs, one EFS-backed sidecar

`module/ecs-app` is **not** a single generic ECS service — it deploys two
independent Fargate services behind two ALBs, both in `main.tf`'s
`module.ecs_app` block (`enable_application` flag, `aws.ecs` provider alias):

| Service | Task def | ALB | Reachability | CPU/Mem |
|---|---|---|---|---|
| `aws_ecs_service.webapp` | `aws_ecs_task_definition.webapp` (family `${application_name}-webapp`) | `aws_lb.webapp` — **external**, public subnets, HTTP+HTTPS from `0.0.0.0/0` | Internet-facing | 512 / 1024 |
| `aws_ecs_service.api` | `aws_ecs_task_definition.api` (family `${application_name}-api`), EFS volume `mongodb-data` for the Mongo sidecar | `aws_lb.api` — **internal**, private subnets only, `internal = true` | VPC-only, no internet path | 1024 / 2048, `desired_count` forced to a single writer (EFS constraint) |

Container definitions: `webapp` is inline `jsonencode(...)` in `main.tf`; `api`
uses `templatefile("${path.root}/container_definitions.json.tpl", {...})` at
the repo's `TERRAFORM_AWS` root — **not** a second inline block. If you need
to add an env var or secret to the API container, edit
`container_definitions.json.tpl`, not `module/ecs-app/main.tf`.

Security groups follow a strict internet → webapp-ALB → webapp-tasks →
api-ALB (internal) → api-tasks chain (see `aws_security_group.webapp_alb`,
`webapp_tasks`, `api_alb`, `api_tasks` in `main.tf`) — each SG's ingress
references the *previous* SG's ID, never a CIDR block, past the webapp ALB.
Preserve this chain; don't add a CIDR-based shortcut across it.

`task_execution_role_arn` and `app_task_role_arn` are passed in as module
variables from `module.iam`'s outputs (see `main.tf`'s `module.ecs_app` block)
— this module never creates its own IAM roles. If a fix requires new IAM
permissions, that's Phase B (`iam-roles-ecs`), not this skill.

EFS wiring: `efs_file_system_id` / `mongodb_ap_id` come from `module.efs`, and
NFS ingress from the API task SG to the EFS SG is added at the **root**
`main.tf` level (`aws_security_group_rule.efs_nfs_from_api`), not inside
`module/ecs-app`, specifically to avoid an `ecs_app → efs → ecs_app`
circular module dependency. Don't move that rule into `module/ecs-app`.

---

## Valid Fargate CPU/memory pairs (for any new task definition)

```
256→512/1024/2048  512→1024-4096  1024→2048-8192  2048→4096-16384  4096→8192-30720
```

`network_mode = "awsvpc"` and `requires_compatibilities = ["FARGATE"]` are
required on every task definition; `launch_type = "FARGATE"` and
`assign_public_ip = false` (both services already use private subnets) are
required on every service.

---

## Verification after changes

```bash
cd $TERRAFORM_AWS

# Validate syntax
terraform validate

# Plan — verify only expected resources in diff
terraform plan 2>&1

# Check for unintended destroy operations
terraform plan -out=plan.tfplan 2>&1
terraform show plan.tfplan | grep -E "will be destroyed|must be replaced"
# If any unexpected destroy → STOP and report to human
```

## Completion report format

```
✅ Phase A Complete — Terraform ECS Fargate (module/ecs-app)

Files created/modified:
- module/ecs-app/main.tf
- container_definitions.json.tpl   (if API container config changed)

terraform validate: ✅ Success
terraform plan: ✅ N resources to add, M to change, 0 to destroy

Ready for Phase B: iam-roles-ecs (only if new IAM permissions are needed)
```
