# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# Cloudwatch Log Groups
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

# VPC Flow Logs Group
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/flowlogs/${var.application_name}"
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_id

  tags = var.tags

  lifecycle {
    create_before_destroy = true
  }
}

# Application Log Group
resource "aws_cloudwatch_log_group" "application" {
  name              = var.application_name
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_id

  tags = var.tags

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudwatch_log_stream" "app_log_stream" {
  name           = "${var.application_name}-stream"
  log_group_name = aws_cloudwatch_log_group.application.name
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# S3 Bucket for ALB Access Logs
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_s3_bucket" "alb_access_logs" {
  bucket = "${var.application_name}-alb-logs-${data.aws_caller_identity.current.account_id}"

  tags = var.tags
}

# Enable S3 access logging on the ALB logs bucket
resource "aws_s3_bucket_logging" "alb_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id

  target_bucket = aws_s3_bucket.alb_access_logs.id
  target_prefix = "s3-access-logs/"
}

data "aws_caller_identity" "current" {}

# Block all public access to ALB logs bucket
resource "aws_s3_bucket_public_access_block" "alb_logs_public_access" {
  bucket = aws_s3_bucket.alb_access_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning on ALB logs bucket
resource "aws_s3_bucket_versioning" "alb_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_id
    }
  }
}

# Bucket policy to allow ALB service to write logs
resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_access_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_elb_service_account.main.id}:root"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_access_logs.arn}/*"
      }
    ]
  })
}

# Get the AWS ELB service account ID for the current region
data "aws_elb_service_account" "main" {}

### ## ## ## ## ## ## ## ## ## ## ## ## ## #
# WAF Logs
# # ## ## ## ## ## ## ## ## ## ## ## ## ## #

resource "aws_cloudwatch_log_group" "waf" {
  name              = "aws-waf-logs-${var.application_name}"
  retention_in_days = var.logs_retention_days
  kms_key_id        = var.kms_key_id

  tags = var.tags

  lifecycle {
    create_before_destroy = true
  }
}