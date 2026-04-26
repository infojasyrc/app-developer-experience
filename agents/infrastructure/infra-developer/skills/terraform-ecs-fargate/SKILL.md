---
name: terraform-ecs-fargate
description: >
  Implements Terraform fixes and new modules for ECS Fargate + ECR + RDS
  deployments on AWS. Use when the plan requires creating or fixing ECS task
  definitions, ECS services, ECR repositories, security groups, or networking
  resources. Always reads monorepo-paths.md then INFRA_PLAN.md Phase A before
  writing any .tf file. Runs terraform validate after each change — never apply.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# terraform-ecs-fargate

Implements Phase A of `INFRA_PLAN.md`: Terraform module fixes for ECS Fargate
+ ECR + RDS. Paths resolved from `agents/shared/context/monorepo-paths.md`.

---

## Before writing any file

```bash
# Always read paths first
cat agents/shared/context/monorepo-paths.md
TERRAFORM_AWS="cloud/terraform/aws"
INFRA_PLANS="agents/infrastructure/plans"

# Read the plan
cat $INFRA_PLANS/INFRA_PLAN.md

# Understand existing module structure
find $TERRAFORM_AWS -name "*.tf" | sort

# Validate current state
cd $TERRAFORM_AWS && terraform validate
terraform plan -out=plan.tfplan 2>&1 | tail -30
```

---

## ECS Task Definition — correct Fargate template

```hcl
# modules/ecs/task_definition.tf
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.app_name}-${var.environment}"
  network_mode             = "awsvpc"          # required for Fargate
  requires_compatibilities = ["FARGATE"]        # required
  cpu                      = var.task_cpu       # e.g. "512"
  memory                   = var.task_memory    # e.g. "1024"
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([{
    name      = var.app_name
    image     = "${var.ecr_repository_url}:${var.image_tag}"
    essential = true

    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]

    environment = [
      for k, v in var.env_vars : { name = k, value = v }
    ]

    secrets = [
      for k, v in var.secrets : {
        name      = k
        valueFrom = v  # SSM ARN or Secrets Manager ARN
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.app_name}-${var.environment}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
        "awslogs-create-group"  = "true"
      }
    }
  }])

  tags = var.common_tags
}
```

## ECS Service — correct Fargate template

```hcl
# modules/ecs/service.tf
resource "aws_ecs_service" "app" {
  name                               = "${var.app_name}-${var.environment}"
  cluster                            = var.ecs_cluster_id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = var.desired_count
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  health_check_grace_period_seconds  = 60

  network_configuration {
    subnets          = var.private_subnet_ids   # always private subnets
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false                     # false for private subnets
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.app_name
    container_port   = var.container_port
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [desired_count]  # managed by auto-scaling
  }

  tags = var.common_tags
}
```

## Security Groups — ECS to RDS

```hcl
# modules/networking/security_groups.tf

# ECS tasks security group
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.app_name}-ecs-tasks-${var.environment}"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = var.vpc_id

  egress {
    description = "Allow all outbound (ECR pull, SSM, CloudWatch)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.common_tags, { Name = "${var.app_name}-ecs-tasks-${var.environment}" })
}

# RDS security group
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-${var.environment}"
  description = "Security group for RDS — only accepts from ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from ECS tasks only"
    from_port       = 5432          # change to 3306 for MySQL
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]  # reference, not CIDR
  }

  tags = merge(var.common_tags, { Name = "${var.app_name}-rds-${var.environment}" })
}

# Allow ECS to reach RDS (explicit ingress rule on ECS SG)
resource "aws_security_group_rule" "ecs_to_rds" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.rds.id
  security_group_id        = aws_security_group.ecs_tasks.id
  description              = "Allow ECS tasks to reach RDS"
}
```

## ECR Repository

```hcl
# modules/ecr/main.tf
resource "aws_ecr_repository" "app" {
  name                 = "${var.app_name}-${var.environment}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = var.common_tags
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}
```

## CloudWatch Log Group

```hcl
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.app_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 90 : 14

  tags = var.common_tags
}
```

## Verification after changes

```bash
cd $TERRAFORM_AWS

# Validate syntax
terraform validate

# Plan — verify only expected resources in diff
terraform plan -var-file="environments/${var.environment}.tfvars" \
  -out=plan.tfplan 2>&1

# Check for unintended destroy operations
terraform show plan.tfplan | grep -E "will be destroyed|must be replaced"
# If any unexpected destroy → STOP and report to human
```

## Completion report format

```
✅ Phase A Complete — Terraform ECS Fargate

Files created/modified:
- modules/ecs/task_definition.tf
- modules/ecs/service.tf
- modules/networking/security_groups.tf

terraform validate: ✅ Success
terraform plan: ✅ N resources to add, M to change, 0 to destroy

Ready for Phase B: iam-roles-ecs
```