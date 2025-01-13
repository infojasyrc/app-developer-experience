output "app_log_group" {
  value = aws_cloudwatch_log_group.application.name
}
