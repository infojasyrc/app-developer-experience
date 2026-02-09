output "vpc_flow_logs_group_arn" {
  value = aws_cloudwatch_log_group.vpc_flow_logs.arn
}

output "app_log_group" {
  value = aws_cloudwatch_log_group.application.name
}
