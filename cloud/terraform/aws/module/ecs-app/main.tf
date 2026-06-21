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
