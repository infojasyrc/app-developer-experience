# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Cloudwatch Log Groups
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

# VPC Flow Logs Group
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flowlogs/${var.application_name}"
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_id

  tags = var.tags
}

# Application Log Group
resource "aws_cloudwatch_log_group" "application" {
  name              = var.application_name
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_id

  tags = var.tags
}

resource "aws_cloudwatch_log_stream" "app_log_stream" {
  name           = "${var.application_name}-stream"
  log_group_name = aws_cloudwatch_log_group.application.name
}
