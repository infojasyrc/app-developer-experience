# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Security Groups
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

resource "aws_security_group" "webapp_alb" {
  name        = "${var.application_name}-webapp-alb-sg"
  description = "Webapp external ALB: HTTP/HTTPS ingress from internet; egress to VPC only"
  vpc_id      = var.vpc_id

  ingress {
    description      = "HTTP from internet"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "HTTPS from internet"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    description = "Forward to webapp tasks within VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(var.tags, { Name = "sg-webapp-alb" })
}

resource "aws_security_group" "webapp_tasks" {
  name        = "${var.application_name}-webapp-tasks-sg"
  description = "Webapp tasks: Next.js port 3000 from webapp ALB SG only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Next.js from webapp ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.webapp_alb.id]
  }

  egress {
    description = "VPC egress: API internal ALB, Secrets Manager and ECR VPC endpoints"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(var.tags, { Name = "sg-webapp-tasks" })
}

# Internal ALB — accepts only from webapp tasks SG; no internet path
resource "aws_security_group" "api_alb" {
  name        = "${var.application_name}-api-alb-sg"
  description = "Internal API ALB: port 80 from webapp tasks SG only — no internet path"
  vpc_id      = var.vpc_id

  ingress {
    description     = "From webapp tasks SG only"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.webapp_tasks.id]
  }

  egress {
    description = "Forward to API tasks within VPC"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(var.tags, { Name = "sg-api-alb" })
}

resource "aws_security_group" "api_tasks" {
  name        = "${var.application_name}-api-tasks-sg"
  description = "API tasks: NestJS port 3000 from API ALB SG only; MongoDB sidecar is localhost"
  vpc_id      = var.vpc_id

  ingress {
    description     = "NestJS API from internal ALB only"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.api_alb.id]
  }

  egress {
    description = "VPC egress: Secrets Manager, ECR, EFS mount targets"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(var.tags, { Name = "sg-api-tasks" })
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Webapp External ALB
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

resource "aws_lb" "webapp" {
  name                       = "${var.application_name}-webapp"
  internal                   = false
  load_balancer_type         = "application"
  subnets                    = var.public_subnets
  security_groups            = [aws_security_group.webapp_alb.id]
  enable_deletion_protection = var.enable_deletion_protection
  drop_invalid_header_fields = true

  access_logs {
    bucket  = var.access_logs_bucket
    prefix  = "webapp-alb"
    enabled = true
  }

  tags = merge(var.tags, { Name = "alb-webapp" })
}

resource "aws_wafv2_web_acl_association" "webapp" {
  count        = var.enable_waf ? 1 : 0
  resource_arn = aws_lb.webapp.arn
  web_acl_arn  = var.waf_acl_arn
}

resource "aws_lb_target_group" "webapp" {
  name        = "${var.application_name}-webapp-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, { Name = "tg-webapp" })
}

resource "aws_lb_listener" "webapp_http" {
  load_balancer_arn = aws_lb.webapp.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.webapp.arn
  }

  tags = var.tags
}

# HTTPS listener — only created when acm_certificate_arn is provided
resource "aws_lb_listener" "webapp_https" {
  count             = var.acm_certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.webapp.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.webapp.arn
  }

  tags = var.tags
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# API Internal ALB — no internet path
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

resource "aws_lb" "api" {
  name                       = "${var.application_name}-api"
  internal                   = true
  load_balancer_type         = "application"
  subnets                    = var.private_subnets
  security_groups            = [aws_security_group.api_alb.id]
  enable_deletion_protection = var.enable_deletion_protection
  drop_invalid_header_fields = true

  access_logs {
    bucket  = var.access_logs_bucket
    prefix  = "api-alb"
    enabled = true
  }

  tags = merge(var.tags, { Name = "alb-api" })
}

resource "aws_lb_target_group" "api" {
  name        = "${var.application_name}-api-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, { Name = "tg-api" })
}

resource "aws_lb_listener" "api_http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = var.tags
}

resource "aws_lb_listener" "api_https" {
  count             = var.acm_certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = var.tags
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Webapp ECS — Next.js, 512 CPU / 1024 MB
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

resource "aws_cloudwatch_log_group" "webapp" {
  name              = "/ecs/${var.application_name}/webapp"
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_arn

  tags = var.tags
}

resource "aws_ecs_task_definition" "webapp" {
  family                   = "${var.application_name}-webapp"
  task_role_arn            = var.app_task_role_arn
  execution_role_arn       = var.task_execution_role_arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"

  container_definitions = jsonencode([{
    name      = "cm-webapp"
    image     = var.ui_image
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = "3000" },
      # Server-side Next.js only — this URL never reaches the browser
      { name = "API_INTERNAL_URL", value = "http://${aws_lb.api.dns_name}" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.application_name}/webapp"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "webapp"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "wget -qO- http://localhost:3000/ || exit 1"]
      interval    = 30
      timeout     = 10
      retries     = 3
      startPeriod = 60
    }
  }])

  tags = merge(var.tags, { Name = "task-def-webapp" })
}

resource "aws_ecs_service" "webapp" {
  name                              = "${var.application_name}-webapp"
  cluster                           = var.cluster_id
  task_definition                   = aws_ecs_task_definition.webapp.arn
  desired_count                     = 1
  launch_type                       = "FARGATE"
  platform_version                  = "LATEST"
  force_new_deployment              = true
  health_check_grace_period_seconds = 60

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    security_groups  = [aws_security_group.webapp_tasks.id]
    subnets          = var.private_subnets
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.webapp.arn
    container_name   = "cm-webapp"
    container_port   = 3000
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_lb_listener.webapp_http]
  tags       = merge(var.tags, { Name = "service-webapp" })
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# API ECS — NestJS + MongoDB sidecar, 1024 CPU / 2048 MB
# desired_count = 1 enforced: only one writer to the EFS volume at a time
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.application_name}/api"
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_arn

  tags = var.tags
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.application_name}-api"
  task_role_arn            = var.app_task_role_arn
  execution_role_arn       = var.task_execution_role_arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"

  volume {
    name = "mongodb-data"
    efs_volume_configuration {
      file_system_id     = var.efs_file_system_id
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = var.mongodb_ap_id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = templatefile("${path.root}/container_definitions.json.tpl", {
    api_image        = var.api_image
    aws_region       = var.aws_region
    log_group        = "/ecs/${var.application_name}/api"
    mongo_secret_arn = var.mongo_secret_arn
    api_mode         = "production"
  })

  tags = merge(var.tags, { Name = "task-def-api" })
}

resource "aws_ecs_service" "api" {
  name                              = "${var.application_name}-api"
  cluster                           = var.cluster_id
  task_definition                   = aws_ecs_task_definition.api.arn
  desired_count                     = 1
  launch_type                       = "FARGATE"
  platform_version                  = "LATEST"
  force_new_deployment              = true
  health_check_grace_period_seconds = 120

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    security_groups  = [aws_security_group.api_tasks.id]
    subnets          = var.private_subnets
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "cm-api"
    container_port   = 3000
  }

  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_lb_listener.api_http]
  tags       = merge(var.tags, { Name = "service-api" })
}
