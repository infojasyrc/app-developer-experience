locals {
  region      = var.aws_account_region
  environment = var.application_env
  common_tags = {
    project = var.application_name,
  }
}

module "kms" {
  source = "./module/kms"

  providers = {
    aws = aws.kms
  }

  application_name    = "${var.application_name}-${local.environment}"
  aws_region          = var.aws_account_region
  terraform_role_name = "appdevexp-deployer"

  tags = local.common_tags
}


module "logging" {
  source = "./module/logging"

  providers = {
    aws    = aws.logs
    aws.s3 = aws.s3
  }

  application_name    = "${var.application_name}-${local.environment}"
  logs_retention_days = var.logs_retention_days
  kms_key_id          = module.kms.key_arn
  aws_region          = var.aws_account_region

  tags = local.common_tags

  # Ensure KMS key policy is created before CloudWatch uses it
  depends_on = [module.kms]
}

module "network" {
  source = "./module/network"

  providers = {
    aws = aws.ecs
  }

  vpc_cidr = var.vpc_cidr
  az_count = var.az_count

  tags = local.common_tags

  vpc_flow_logs_group_arn = module.logging.vpc_flow_logs_group_arn
}

module "cluster" {
  source = "./module/cluster"

  providers = {
    aws = aws.ecs
  }

  application_name = "${var.application_name}-${local.environment}"
  tags             = local.common_tags
}

# module "database" {
#   count  = var.enable_database ? 1 : 0
#   source = "./module/database"

#   application_name        = "${var.application_name}-${local.environment}"
#   db_allocate_storage     = var.db_allocate_storage
#   db_max_allocate_storage = var.db_max_allocate_storage
#   db_name                 = var.db_name
#   db_username             = var.db_username
#   db_password             = var.db_password
#   db_multi_zone           = var.db_multi_zone
#   db_deletion_protection  = var.db_deletion_protection
#   db_instance_class       = var.db_instance_class
#   db_instance_accessible  = var.db_instance_accessible
#   vpc_id                  = module.network.vpc_id
#   private_subnets         = module.network.private_subnets
#   tags                    = local.common_tags
# }

module "iam" {
  source = "./module/iam"

  providers = {
    aws = aws.ecs
  }

  application_name = "${var.application_name}-${local.environment}"
  account_id       = var.aws_account_id
  aws_region       = var.aws_account_region
  kms_key_arn      = module.kms.key_arn
}

module "efs" {
  source = "./module/efs"

  providers = {
    aws = aws.ecs
  }

  application_name = "${var.application_name}-${local.environment}"
  vpc_id           = module.network.vpc_id
  private_subnets  = module.network.private_subnets
  allowed_sg_ids   = [] # populated in Phase 3 once ecs-app task SGs exist
  kms_key_arn      = module.kms.key_arn

  tags = local.common_tags

  depends_on = [module.kms, module.network]
}

module "security" {
  source = "./module/security"

  providers = {
    aws      = aws.waf
    aws.logs = aws.logs
  }

  application_name  = "${var.application_name}-${local.environment}"
  waf_log_group_arn = module.logging.waf_log_group_arn

  tags = local.common_tags
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# ECS Application — webapp + API services
# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #

module "ecs_app" {
  count  = var.enable_application ? 1 : 0
  source = "./module/ecs-app"

  providers = {
    aws = aws.ecs
  }

  application_name           = "${var.application_name}-${local.environment}"
  vpc_id                     = module.network.vpc_id
  vpc_cidr                   = var.vpc_cidr
  public_subnets             = module.network.public_subnets
  private_subnets            = module.network.private_subnets
  cluster_id                 = module.cluster.cluster_id
  task_execution_role_arn    = module.iam.task_execution_role_arn
  app_task_role_arn          = module.iam.app_task_role_arn
  desired_count              = var.app_desired_count
  api_image                  = "${var.ecr_backend}:latest"
  ui_image                   = "${var.ecr_frontend}:latest"
  aws_region                 = var.aws_account_region
  api_domain                 = var.api_domain
  access_logs_bucket         = module.logging.alb_access_logs_bucket
  waf_acl_arn                = module.security.waf_acl_arn
  enable_waf                 = true
  kms_key_arn                = module.kms.key_arn
  logs_retention_days        = var.logs_retention_days
  database_secret_arn        = "arn:aws:secretsmanager:${var.aws_account_region}:${var.aws_account_id}:secret:/appdevexp/dev/mongo/admin"
  efs_file_system_id         = module.efs.file_system_id
  mongodb_ap_id              = module.efs.mongodb_ap_id
  acm_certificate_arn        = var.acm_certificate_arn
  enable_deletion_protection = false

  tags = local.common_tags

  depends_on = [module.iam, module.efs, module.cluster, module.network]
}

# Adds NFS ingress to the EFS SG from the API task SG.
# Created here rather than via module.efs.allowed_sg_ids to avoid the
# ecs_app → efs → ecs_app circular dependency.
resource "aws_security_group_rule" "efs_nfs_from_api" {
  provider                 = aws.ecs
  count                    = var.enable_application ? 1 : 0
  type                     = "ingress"
  from_port                = 2049
  to_port                  = 2049
  protocol                 = "tcp"
  source_security_group_id = module.ecs_app[0].api_tasks_sg_id
  security_group_id        = module.efs.efs_sg_id
  description              = "NFS from API task security group"
}

# # ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# # Application on ECS
# # # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

# module "auto_scaling" {
#   count             = var.enable_auto_scaling ? 1 : 0
#   source            = "./module/auto-scaling"
#   application_name  = "${var.application_name}-${local.environment}"
#   cluster_name      = module.cluster.cluster_name
#   ecs_service_name  = module.application[0].service_name
#   min_capacity      = var.min_capacity
#   max_capacity      = var.max_capacity
#   target_for_cpu    = var.target_for_cpu
#   target_for_memory = var.target_for_memory
# }
