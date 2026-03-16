data "aws_caller_identity" "current" {}

resource "aws_cloudwatch_log_resource_policy" "waf_logging" {
  policy_name = "waf-logging-policy"

  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "delivery.logs.amazonaws.com",
            "wafv2.amazonaws.com"
          ]
        }
        Action   = "logs:PutLogEvents"
        Resource = "${trimsuffix(var.waf_log_group_arn, ":*")}:*"
      },
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "delivery.logs.amazonaws.com",
            "wafv2.amazonaws.com"
          ]
        }
        Action   = "logs:CreateLogStream"
        Resource = "${trimsuffix(var.waf_log_group_arn, ":*")}:*"
      }
    ]
  })
}

resource "aws_wafv2_web_acl" "alb" {
  name  = "${var.application_name}-alb-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 0

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 1

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.application_name}-alb-waf"
    sampled_requests_enabled   = true
  }

  tags = var.tags
}

resource "aws_wafv2_web_acl_logging_configuration" "alb" {
  resource_arn            = aws_wafv2_web_acl.alb.arn
  log_destination_configs = [trimsuffix(var.waf_log_group_arn, ":*")]

  logging_filter {
    default_behavior = "KEEP"

    filter {
      behavior = "KEEP"
      condition {
        action_condition {
          action = "BLOCK"
        }
      }
      requirement = "MEETS_ANY"
    }
  }

  depends_on = [aws_cloudwatch_log_resource_policy.waf_logging]
}