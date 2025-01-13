# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# DNS + SSL Discovery
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

data "aws_route53_zone" "application" {
  name = "${var.domain}."
}

data "aws_acm_certificate" "application" {
  domain   = "*.${var.domain}"
  statuses = ["ISSUED"]
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Security Groups
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

# ALB Security Group: Edit to restrict access to the application
resource "aws_security_group" "lb-sg" {
  name        = "${var.application_name}-lb"
  description = "controls access to the ALB"
  vpc_id      = var.vpc_id

  # ingress {
  #   description      = "Allow HTTP traffic"
  #   protocol         = "tcp"
  #   from_port        = 80
  #   to_port          = 80
  #   cidr_blocks      = ["0.0.0.0/0"]
  #   ipv6_cidr_blocks = ["::/0"]
  # }

  ingress {
    description      = "Allow HTTPS traffic"
    protocol         = "tcp"
    from_port        = 443
    to_port          = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # Review CKV_AWS_382: Ensure no security groups allow egress traffic to all
  egress {
    description      = "Allow all traffic out"
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["10.0.0.0/16"] # Restrict to internal network
    ipv6_cidr_blocks = []
  }

  tags = merge(var.tags, tomap({ "Name" : "sg-load-balancer" }))
}

# Traffic to the ECS cluster should only come from the ALB
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.application_name}-ecs-tasks"
  description = "allow inbound access from the ALB only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Listen request from ALB"
    protocol        = "tcp"
    from_port       = 80
    to_port         = 80
    security_groups = [aws_security_group.lb-sg.id]
  }

  ingress {
    description     = "Listen request from ALB"
    protocol        = "tcp"
    from_port       = 4000
    to_port         = 4000
    security_groups = [aws_security_group.lb-sg.id]
  }

  egress {
    description      = "Allow all traffic out"
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["10.0.0.0/16"] # Restrict to internal network
    ipv6_cidr_blocks = []
  }

  tags = merge(var.tags, tomap({ "Name" : "sg-ecs" }))
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Load Balancer + Target Groups
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_alb" "webapp" {
  name            = var.application_name
  subnets         = var.public_subnets
  security_groups = [aws_security_group.lb-sg.id]
  enable_deletion_protection = true
  drop_invalid_header_fields = true

  access_logs {
    bucket  = var.access_logs_bucket
    prefix  = var.access_logs_prefix
    enabled = true
  }
}

resource "aws_wafv2_web_acl_association" "webapp_waf" {
  resource_arn = aws_alb.webapp.arn
  web_acl_arn  = var.waf_acl_arn
}

resource "aws_alb_target_group" "webapp" {
  name        = "${var.application_name}-webapp"
  port        = 443
  protocol    = "HTTPS"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    interval            = 30
    protocol            = "HTTPS"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    healthy_threshold   = 3
    unhealthy_threshold = 2
  }
}

resource "aws_alb_target_group" "api" {
  name        = "${var.application_name}-api"
  port        = 443
  protocol    = "HTTPS"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    interval            = "30"
    protocol            = "HTTPS"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    healthy_threshold   = "3"
    unhealthy_threshold = "2"
  }
}

resource "aws_alb_listener" "webapp" {
  load_balancer_arn = aws_alb.webapp.id
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = data.aws_acm_certificate.application.arn
  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Unauthorized"
      status_code  = "401"
    }
  }
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# ALB Sub Domain Routing Rules
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_alb_listener.webapp.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.api.arn
  }

  condition {
    host_header {
      values = ["${var.api_domain}"]
    }
  }
}

resource "aws_lb_listener_rule" "webapp" {
  listener_arn = aws_alb_listener.webapp.arn

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.webapp.arn
  }

  condition {
    host_header {
      values = ["${var.ui_domain}"]
    }
  }
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# DNS Routing
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_route53_record" "ui_app" {
  zone_id = data.aws_route53_zone.application.zone_id
  name    = "${var.ui_domain}."
  type    = "CNAME"
  ttl     = "30"
  records = ["${aws_alb.webapp.dns_name}"]
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.application.zone_id
  name    = "${var.api_domain}."
  type    = "CNAME"
  ttl     = "30"
  records = ["${aws_alb.webapp.dns_name}"]
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# ECS Services and Tasks
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_ecs_task_definition" "app" {
  family                   = var.application_name
  execution_role_arn       = var.ecs_task_execution_role
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu_for_tasks
  memory                   = var.memory_for_tasks
  container_definitions    = var.container_definitions
}

resource "aws_ecs_service" "app" {
  name                 = var.application_name
  cluster              = var.cluster_id
  task_definition      = aws_ecs_task_definition.app.arn
  desired_count        = var.app_count
  launch_type          = "FARGATE"
  platform_version     = "LATEST"
  force_new_deployment = true

  lifecycle {
    ignore_changes = [desired_count]
  }

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = var.private_subnets
    assign_public_ip = var.assign_public_ip
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.api.id
    container_name   = "${var.container_name}_api"
    container_port   = 4000
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.webapp.arn
    container_name   = "${var.container_name}_ui"
    container_port   = 80
  }

  depends_on = [aws_alb_listener.webapp]

  tags = var.tags
}
