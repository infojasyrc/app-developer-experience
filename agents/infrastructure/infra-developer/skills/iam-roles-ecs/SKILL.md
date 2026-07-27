---
name: iam-roles-ecs
description: >
  Creates and fixes IAM roles and policies for ECS Fargate deployments in
  this repo's actual module/iam structure: ecs_service_role (service
  auto-scaling), task_execution role (ECR pull, CloudWatch, Secrets Manager,
  EFS mount at startup), and app_task role (Secrets Manager at runtime).
  Use when the plan identifies IAM permission gaps in module/iam. Always
  uses least-privilege — never AdministratorAccess or wildcard resources.
  Requires Phase A complete. Does NOT create a GitHub Actions OIDC role —
  that role is Makefile-managed; see the note below before touching CI auth.
metadata:
  author: app-dev-exp
  version: "2.0"
---

# iam-roles-ecs

Implements Phase B of `INFRA_PLAN.md`: IAM roles and policies for ECS Fargate,
in `cloud/terraform/aws/module/iam/`. Paths resolved from
`agents/shared/context/monorepo-paths.md`.

---

## Before writing any file

```bash
# Always read paths first
cat agents/shared/context/monorepo-paths.md
# dual-IAM-system map — read before touching any role
cat agents/shared/context/aws-infrastructure-map.md
TERRAFORM_AWS="cloud/terraform/aws"
INFRA_PLANS="agents/infrastructure/plans"

cat $INFRA_PLANS/INFRA_PLAN.md  # read Phase B section
cat $TERRAFORM_AWS/module/iam/main.tf $TERRAFORM_AWS/module/iam/variables.tf $TERRAFORM_AWS/module/iam/outputs.tf
terraform validate
```

**Read `aws-infrastructure-map.md` §1 first.** There are two independently
maintained IAM provisioning systems in this repo — `module/iam` (Terraform,
what's actually live) and `makefiles/aws-roles.mk` + `iam/*.json.tpl`
(Makefile/AWS CLI, admin-run, not live). This skill only ever touches
`module/iam`. If a finding says the fix is in `iam/*.json.tpl` or
`makefiles/aws-roles.mk`, that is **not** this skill's job — flag it back to
the plan rather than implementing it here.

---

## Real module structure (`module/iam/`)

Three roles, one Terraform module, each already wired into `main.tf`'s
`module.iam` block (`aws.ecs` provider alias) and consumed by
`module.ecs_app` via `task_execution_role_arn` / `app_task_role_arn` outputs:

| Role (Terraform resource) | Live name | Purpose |
|---|---|---|
| `aws_iam_role.ecs_service_role` | `${application_name}-ecs-role-manager` | ECS service auto-scaling (application-autoscaling, CloudWatch alarms, SNS) — **not** a task role |
| `aws_iam_role.task_execution` | `${application_name}-task-execution-role` | ECS agent: pull image (managed `AmazonECSTaskExecutionRolePolicy`) + Secrets Manager read + KMS decrypt + EFS mount |
| `aws_iam_role.app_task` | `${application_name}-app-task-role` | Application container runtime: Secrets Manager read for `/appdevexp/dev/*` only |

All three carry `permissions_boundary = "arn:aws:iam::${var.account_id}:policy/appdevexp-permissions-boundary"`
(Makefile-bootstrapped boundary policy — see `aws-infrastructure-map.md` §3).
Never create a role in this module without that boundary attached.

**Naming convention:** `${var.application_name}-<role-purpose>` — no
environment suffix inside the role name itself (`application_name` already
includes the environment via `main.tf`'s `"${var.application_name}-${local.environment}"`
interpolation at the call site). Do not invent a different naming scheme —
this is the one real scheme, and there is already a second, incompatible one
in the Makefile system that this repo is trying to *not* add a third to.

### Task execution role — extending permissions

```hcl
# module/iam/main.tf — extend the existing aws_iam_role_policy.task_execution_extras
# statement list; do not create a second inline policy for the same purpose.

resource "aws_iam_role_policy" "task_execution_extras" {
  name = "${var.application_name}-task-execution-extras"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SecretsManagerRead"
        Effect = "Allow"
        Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.account_id}:secret:/appdevexp/*"
      },
      {
        Sid      = "KmsDecrypt"
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = var.kms_key_arn
      },
      {
        Sid    = "EfsMount"
        Effect = "Allow"
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientRootAccess",
          "elasticfilesystem:ClientWrite",
          "elasticfilesystem:DescribeMountTargets"
        ]
        Resource = "arn:aws:elasticfilesystem:${var.aws_region}:${var.account_id}:file-system/*"
      }
      # New statement goes here — scope Resource as tightly as the existing ones.
    ]
  })
}
```

### App task role — extending permissions

```hcl
# module/iam/main.tf — extend aws_iam_role_policy.app_task_policy's statement list.
# Current scope is deliberately narrow: /appdevexp/dev/* only, nothing broader.

resource "aws_iam_role_policy" "app_task_policy" {
  name = "${var.application_name}-app-task-policy"
  role = aws_iam_role.app_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "SecretsManagerDevRead"
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${var.account_id}:secret:/appdevexp/dev/*"
      }
      # New statement goes here.
    ]
  })
}
```

If a new permission doesn't fit either role's existing purpose (execution vs.
app runtime), don't force it in — flag as an `⚠️ UNPLANNED FINDING` per
`infra-developer`'s Deviation Protocol instead of guessing which role should
own it.

---

## GitHub Actions OIDC role — NOT created here

**This skill does not create, and must never create, a GitHub Actions OIDC
role in Terraform.** In this repo, OIDC role creation is deliberately kept
out of Terraform — it lives in `makefiles/aws-roles.mk`'s `bootstrap-deployer`
target (creates `appdevexp-deployer` from `iam/terraform-trust-policy.json.tpl`),
precisely so Terraform's own credentials don't have to bootstrap themselves.
`AWS_ROLE_ARN` in GitHub repo secrets points at `appdevexp-deployer`, not at
anything this module creates.

If a plan phase asks for a Terraform-created OIDC/GitHub Actions role: that
would create a **third**, parallel IAM system on top of the two already
described in `aws-infrastructure-map.md` §1 — stop, flag it as an
`⚠️ UNPLANNED FINDING`, and do not implement it without explicit human
confirmation that this is an intentional architecture change.

---

## Verification

```bash
cd $TERRAFORM_AWS
terraform validate
terraform plan 2>&1 | grep -E "will be created|will be updated|will be destroyed|Error"

# After plan looks correct — simulate permissions (never apply yet)
aws iam simulate-principal-policy \
  --policy-source-arn $(terraform output -raw task_execution_role_arn 2>/dev/null || echo "<pending-apply>") \
  --action-names "secretsmanager:GetSecretValue" "kms:Decrypt" \
  --query 'EvaluationResults[*].{Action:EvalActionName,Decision:EvalDecision}'
```

## Completion report format

```
✅ Phase B Complete — IAM Roles (module/iam)

Modified:
- module/iam/main.tf   (extended task_execution_extras / app_task_policy statements)

terraform validate: ✅
terraform plan: ✅ N to change, 0 to add, 0 to destroy

Note: appdevexp-deployer (GitHub OIDC role) is Makefile-managed — not touched by this phase.
```
