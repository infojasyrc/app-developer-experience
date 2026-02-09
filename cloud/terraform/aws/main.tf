locals {
  region      = var.aws_account_region
  environment = terraform.workspace
  common_tags = {
    project = var.application_name,
  }
}

module "network" {
  source = "./module/network"

  vpc_cidr = var.vpc_cidr
  az_count = var.az_count
  tags     = local.common_tags
}

module "cluster" {
  source = "./module/cluster"

  application_name = "${var.application_name}-${local.environment}"
  tags             = local.common_tags
}

module "logging" {
  source = "./module/logging"

  application_name    = "${var.application_name}-${local.environment}"
  logs_retention_days = var.logs_retention_days
  tags                = local.common_tags
}

module "database" {
  source = "./module/database"

  application_name        = "${var.application_name}-${local.environment}"
  db_allocate_storage     = var.db_allocate_storage
  db_max_allocate_storage = var.db_max_allocate_storage
  db_name                 = var.db_name
  db_username             = var.db_username
  db_password             = var.db_password
  db_multi_zone           = var.db_multi_zone
  db_deletion_protection  = var.db_deletion_protection
  db_instance_class       = var.db_instance_class
  db_instance_accessible  = var.db_instance_accessible
  vpc_id                  = module.network.vpc_id
  private_subnets         = module.network.private_subnets
  tags                    = local.common_tags
}

module "iam" {
  source           = "./module/iam"
  application_name = "${var.application_name}-${local.environment}"
}

# # ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# # Application on ECS
# # # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

module "application" {
  source           = "./module/application"
  application_name = "${var.application_name}-${local.environment}"
  private_subnets  = module.network.private_subnets
  public_subnets   = module.network.public_subnets
  container_definitions = templatefile("./container_definitions.json.tpl", {
    api_image                   = "${var.ecr_backend}:latest"
    ui_image                    = "${var.ecr_frontend}:latest"
    container_name              = var.container_name
    aws_region                  = var.aws_account_region
    log_group                   = module.logging.app_log_group
    db_url                      = "postgresql://${var.db_username}:${var.db_password}@${module.database.db_endpoint}"
    db_name                     = var.db_name
    flask_mode                  = var.flask_mode
    api_entrypoint_folder       = var.api_entrypoint_folder
    migration_entrypoint_folder = var.migration_entrypoint_folder
  })
  cluster_id              = module.cluster.cluster_id
  ecs_task_execution_role = module.iam.ecs_service_role.arn
  app_count               = var.app_count
  cpu_for_tasks           = var.cpu_for_tasks
  memory_for_tasks        = var.memory_for_tasks
  vpc_id                  = module.network.vpc_id
  health_check_path       = var.health_check_path
  domain                  = var.domain
  ui_domain               = var.ui_domain
  api_domain              = var.api_domain
  container_name          = var.container_name
  assign_public_ip        = var.assign_public_ip
  tags                    = local.common_tags
}

# # ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# # Application on ECS
# # # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

module "auto_scaling" {
  source            = "./module/auto-scaling"
  application_name  = "${var.application_name}-${local.environment}"
  cluster_name      = module.cluster.cluster_name
  ecs_service_name  = module.application.service_name
  min_capacity      = var.min_capacity
  max_capacity      = var.max_capacity
  target_for_cpu    = var.target_for_cpu
  target_for_memory = var.target_for_memory
}
