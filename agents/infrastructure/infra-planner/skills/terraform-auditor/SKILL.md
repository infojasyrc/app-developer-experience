---
name: terraform-auditor
description: >
  Audits existing Terraform modules targeting AWS ECS Fargate + ECR + RDS.
  Validates module structure, identifies missing resources, checks state
  consistency, and produces a prioritized finding list. Use when the user
  asks to audit Terraform, diagnose infra issues, or before any Terraform
  implementation task. Always produces findings as input to INFRA_PLAN.md —
  never modifies .tf files.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# terraform-auditor

Audits Terraform modules for ECS Fargate + ECR + RDS deployments. Output
feeds into `INFRA_PLAN.md`.

---

## Phase 1 — Load paths and discover modules

```bash
# Always read paths first
cat agents/shared/context/monorepo-paths.md

# Set local alias (use TERRAFORM_ROOT from the file)
TERRAFORM_ROOT="cloud/terraform/aws"

# Map existing module structure
find $TERRAFORM_ROOT -name "*.tf" | sort
find $TERRAFORM_ROOT -name "*.tfvars" | sort
find $TERRAFORM_ROOT -name "backend.tf" -o -name "versions.tf" | sort

# Check state backend config
cat $TERRAFORM_ROOT/backend.tf 2>/dev/null

# Check provider versions
grep -rn "required_providers\|version\s*=" \
  $TERRAFORM_ROOT --include="*.tf" | head -30
```

## Phase 2 — ECS Fargate module validation

```bash
# Find ECS-related resources
grep -rn "aws_ecs_cluster\|aws_ecs_service\|aws_ecs_task_definition" \
  $TERRAFORM_ROOT --include="*.tf" -l

# Find ECR repos
grep -rn "aws_ecr_repository" $TERRAFORM_ROOT --include="*.tf"

# Find task definition — check cpu/memory, network_mode, launch_type
grep -rn "launch_type\|network_mode\|cpu\|memory\|requires_compatibilities" \
  $TERRAFORM_ROOT --include="*.tf"
```

**Validate these are present and correct:**

| Resource | Required value | Common mistake |
|---|---|---|
| `network_mode` | `"awsvpc"` | `"bridge"` breaks Fargate |
| `requires_compatibilities` | `["FARGATE"]` | Missing → defaults to EC2 |
| `launch_type` on service | `"FARGATE"` | Missing → silent EC2 fallback |
| `cpu` + `memory` | Valid Fargate combination | Invalid pair → task won't start |

Valid Fargate CPU/memory combinations:
```
256 cpu  → 512, 1024, 2048 MB
512 cpu  → 1024–4096 MB (1GB increments)
1024 cpu → 2048–8192 MB (1GB increments)
2048 cpu → 4096–16384 MB (1GB increments)
4096 cpu → 8192–30720 MB (1GB increments)
```

## Phase 3 — Networking validation

```bash
# Find VPC, subnets, security groups
grep -rn "aws_vpc\|aws_subnet\|aws_security_group\|aws_security_group_rule" \
  $TERRAFORM_ROOT --include="*.tf" -l

# Check if ECS service is in private subnets
grep -rn "subnets\|subnet_ids" $TERRAFORM_ROOT --include="*.tf"

# Check security group rules for ECS → RDS port
grep -rn "from_port\|to_port\|cidr_blocks\|source_security_group_id" \
  $TERRAFORM_ROOT --include="*.tf"
```

**Validate:**
- ECS tasks run in **private** subnets (not public)
- ECS security group allows **outbound** to RDS security group on port 5432 (Postgres) or 3306 (MySQL)
- RDS security group allows **inbound** from ECS security group only (not 0.0.0.0/0)
- NAT Gateway exists for private subnet outbound internet (ECR pull, SSM, etc.)

## Phase 4 — RDS module validation

```bash
grep -rn "aws_db_instance\|aws_rds_cluster" $TERRAFORM_ROOT --include="*.tf"
grep -rn "db_subnet_group\|aws_db_subnet_group" $TERRAFORM_ROOT --include="*.tf"
grep -rn "publicly_accessible" $TERRAFORM_ROOT --include="*.tf"
```

**Validate:**
- `publicly_accessible = false`
- `db_subnet_group_name` references private subnets
- `deletion_protection = true` in prod

## Phase 5 — Live state check (if AWS CLI available)

```bash
# Verify ECS cluster exists and is active
aws ecs describe-clusters --clusters $(grep -r "cluster_name\|name.*cluster" \
  $TERRAFORM_AWS --include="*.tf" | grep -oP '"[^"]+"' | head -1) \
  --query 'clusters[0].status' --output text

# Check for failed tasks
aws ecs list-tasks --cluster <cluster-name> --desired-status STOPPED \
  --query 'taskArns' --output text | head -5

# Get stopped task failure reason
aws ecs describe-tasks --cluster <cluster-name> \
  --tasks <task-arn> \
  --query 'tasks[0].{status:lastStatus,reason:stoppedReason,containers:containers[*].{name:name,reason:reason,exitCode:exitCode}}'
```

## Phase 6 — Findings classification

Classify each finding:

| Severity | Meaning |
|---|---|
| 🔴 CRITICAL | Will cause deployment failure or security breach |
| 🟡 WARNING | May cause issues under specific conditions |
| 🔵 INFO | Best practice improvement |

## Output format for INFRA_PLAN.md (Phase A section)

```markdown
## Phase A: Terraform Remediation

### Findings
| # | Severity | Resource | Issue | Fix |
|---|---|---|---|---|
| 1 | 🔴 CRITICAL | aws_ecs_task_definition | network_mode is "bridge" | Change to "awsvpc" |
| 2 | 🟡 WARNING | aws_security_group | RDS allows 0.0.0.0/0 inbound | Restrict to ECS SG |

### Terraform changes required
{List .tf files that need modification with specific changes}
```