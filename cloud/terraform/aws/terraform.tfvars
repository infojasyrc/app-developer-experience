application_name    = "appdevexp"
application_env     = "dev"
aws_account_region  = "us-west-1"
az_count            = "2"
vpc_cidr            = "172.17.0.0/16"
logs_retention_days = 3

# database — instance config (non-sensitive)
db_name                 = "conference_manager"
db_allocate_storage     = 20
db_max_allocate_storage = 50
db_multi_zone           = true
db_deletion_protection  = true
db_instance_class       = "db.t3.medium"
db_instance_accessible  = false
# db_username and db_password are sensitive — do NOT set them here.
# Local runs:  copy secrets.auto.tfvars.example → secrets.auto.tfvars and fill in values.
# CI/CD runs:  values are injected as TF_VAR_db_username / TF_VAR_db_password from GitHub secrets.

# ecs variables
app_count         = 1
cpu_for_tasks     = "4096"
memory_for_tasks  = "8192"
ecr_frontend      = "580976914278.dkr.ecr.us-west-1.amazonaws.com/conference-manager/ms-conference-webapp"
ecr_backend       = "580976914278.dkr.ecr.us-west-1.amazonaws.com/conference-manager/ms-conference-api"
container_name    = "conference-manager"
assign_public_ip  = false
health_check_path = "/"
domain            = "test.com"
ui_domain         = "app.test.com"
api_domain        = "api-internal.test.com"

# auto scaling
max_capacity      = 3
min_capacity      = 1
target_for_memory = 80
target_for_cpu    = 60

# application information
api_entrypoint_folder       = ""
migration_entrypoint_folder = ""

# enable modules (activate per phase — see agents/infrastructure/plans/20260620123839.md)
enable_database     = false
enable_iam          = true
enable_efs          = true
enable_application  = true
enable_auto_scaling = false

# HTTPS — provide ACM wildcard cert ARN to enable TLS listeners on both ALBs
# Provision *.test.com cert in ACM first, then set the ARN here.
acm_certificate_arn = ""