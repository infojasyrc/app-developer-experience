resource "aws_ecs_cluster" "main" {
  name = var.application_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}
