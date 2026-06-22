output "api_tasks_sg_id" {
  description = "API tasks security group ID — added to EFS NFS ingress rule to permit EFS mounts"
  value       = aws_security_group.api_tasks.id
}

output "webapp_service_name" {
  description = "Webapp ECS service name — used by the auto-scaling module in Phase 5"
  value       = aws_ecs_service.webapp.name
}

output "api_service_name" {
  description = "API ECS service name — used by the auto-scaling module in Phase 5"
  value       = aws_ecs_service.api.name
}

output "webapp_alb_dns" {
  description = "Webapp external ALB DNS name"
  value       = aws_lb.webapp.dns_name
}

output "api_alb_dns" {
  description = "API internal ALB DNS name — resolves only within the VPC"
  value       = aws_lb.api.dns_name
}
