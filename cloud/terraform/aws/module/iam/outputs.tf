output "ecs_service_role" {
  value = aws_iam_role.ecs_service_role
}

output "task_execution_role_arn" {
  description = "ARN of the ECS task execution role (used by ECS agent to pull images and fetch secrets)"
  value       = aws_iam_role.task_execution.arn
}

output "app_task_role_arn" {
  description = "ARN of the app task role (used by application containers to read /appdevexp/dev/* secrets)"
  value       = aws_iam_role.app_task.arn
}