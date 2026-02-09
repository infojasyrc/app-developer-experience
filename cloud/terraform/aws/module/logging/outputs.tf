output "vpc_flow_logs_group_arn" {
  value = aws_cloudwatch_log_group.vpc_flow_logs.arn
}

output "app_log_group_name" {
  value = aws_cloudwatch_log_group.application.name
}

output "waf_log_group_name" {
  value = aws_cloudwatch_log_group.waf.name
}

output "alb_access_logs_bucket" {
  value = aws_s3_bucket.alb_access_logs.id
}
