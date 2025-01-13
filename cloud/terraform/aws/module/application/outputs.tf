output "service_name" {
  description = "aws ecs service name"
  value       = aws_ecs_service.app.name
}
