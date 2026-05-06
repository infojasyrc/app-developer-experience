---
name: terraform-module-auditor
description: >
  Audits Terraform .tf modules for ECS Fargate + ECR + RDS deployments.
  Validates module structure, provider versions, ECS task definition parameters,
  networking configuration, and RDS settings using static analysis and
  terraform validate. Never runs terraform apply or modifies .tf files. Use
  before any Terraform implementation task. Produces Phase A findings for
  INFRA_PLAN.md. Run before aws-live-auditor.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# terraform-module-auditor

**Input:** `cloud/terraform/aws/` — `.tf` and `.tfvars` files
**Output:** Phase A (Terraform) findings section in `INFRA_PLAN.md`
**Tools:** `find`, `grep`, `terraform validate`, `terraform plan` (read-only)

---

## Step 1 — Load paths

```bash
cat agents/shared/context/monorepo-paths.md
cat agents/shared/context/commit-conventions.md
TERRAFORM_AWS="cloud/terraform/aws"
INFRA_PLANS="agents/infrastructure/infra-planner/output"
```

## Step 2 — Discover module structure

```bash
find $TERRAFORM_AWS -name "*.tf" | sort
find $TERRAFORM_AWS -name "*.tfvars" | sort
find $TERRAFORM_AWS -name "backend.tf" -o -name "versions.tf" | sort

# Provider versions
grep -rn "required_providers\|required_version" \
  $TERRAFORM_AWS --include="*.tf"

# State backend config
cat $TERRAFORM_AWS/backend.tf 2>/dev/null
```

## Step 3 — ECS Fargate validation

```bash
grep -rn "aws_ecs_cluster\|aws_ecs_service\|aws_ecs_task_definition" \
  $TERRAFORM_AWS --include="*.tf" -l

grep -rn "launch_type\|network_mode\|requires_compatibilities\|cpu\|memory" \
  $TERRAFORM_AWS --include="*.tf"
```

**Rules:**

| Attribute | Required | Severity if wrong |
|---|---|---|
| `network_mode` | `"awsvpc"` | 🔴 CRITICAL — Fargate won't start |
| `requires_compatibilities` | `["FARGATE"]` | 🔴 CRITICAL — defaults to EC2 |
| `launch_type` on service | `"FARGATE"` | 🔴 CRITICAL — silent EC2 fallback |
| `cpu` + `memory` | Valid Fargate pair | 🔴 CRITICAL — task rejected |
| `assign_public_ip` on service | `false` | 🟡 WARNING — security risk |

Valid Fargate CPU/memory combinations:
```
256→512/1024/2048  512→1024-4096  1024→2048-8192  2048→4096-16384  4096→8192-30720
```

## Step 4 — Networking validation

```bash
grep -rn "aws_vpc\|aws_subnet\|aws_security_group\|aws_security_group_rule" \
  $TERRAFORM_AWS --include="*.tf" -l

grep -rn "subnets\|subnet_ids\|assign_public_ip" $TERRAFORM_AWS --include="*.tf"
grep -rn "from_port\|to_port\|cidr_blocks\|source_security_group_id" \
  $TERRAFORM_AWS --include="*.tf"
```

**Rules:**
- ECS tasks → **private** subnets only
- RDS SG inbound → ECS SG only, never `0.0.0.0/0` → 🔴 CRITICAL if violated
- NAT Gateway present for ECR pull + SSM + CloudWatch → 🟡 WARNING if missing

## Step 5 — RDS validation

```bash
grep -rn "aws_db_instance\|aws_rds_cluster" $TERRAFORM_AWS --include="*.tf"
grep -rn "publicly_accessible\|deletion_protection\|db_subnet_group" \
  $TERRAFORM_AWS --include="*.tf"
```

- `publicly_accessible = false` → 🔴 CRITICAL if true
- `deletion_protection = true` in prod → 🟡 WARNING if missing

## Step 6 — Static validation

```bash
cd $TERRAFORM_AWS && terraform validate
terraform plan -out=plan.tfplan 2>&1 | tail -40
terraform show plan.tfplan | grep -E "will be destroyed|must be replaced"
# Any destroy on existing resources → STOP and flag 🔴 CRITICAL
```

## Output — INFRA_PLAN.md Phase A section

```markdown
## Phase A: Terraform Module Findings

| # | Severity | Resource | Issue | Fix |
|---|---|---|---|---|
| 1 | 🔴 CRITICAL | aws_ecs_task_definition | network_mode="bridge" | Change to "awsvpc" |
| 2 | 🟡 WARNING | aws_security_group.rds | inbound allows 0.0.0.0/0 | Restrict to ECS SG |

terraform validate: ✅/❌
terraform plan: N to add, M to change, K to destroy
```