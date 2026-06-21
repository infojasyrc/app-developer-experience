output "file_system_id" {
  description = "EFS file system ID — passed to ECS task definitions as efs_file_system_id"
  value       = aws_efs_file_system.main.id
}

output "mongodb_ap_id" {
  description = "Access point ID for MongoDB data (/mongodb-data, uid/gid 999)"
  value       = aws_efs_access_point.mongodb.id
}

output "postgres_ap_id" {
  description = "Access point ID for PostgreSQL data (/postgres-data, uid/gid 70)"
  value       = aws_efs_access_point.postgres.id
}

output "efs_sg_id" {
  description = "EFS security group ID — add as ingress source to ECS task SGs that need EFS mount"
  value       = aws_security_group.efs.id
}
