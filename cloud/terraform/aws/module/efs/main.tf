# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# EFS Security Group
# NFS port 2049 — ingress from ECS task SGs only
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_security_group" "efs" {
  name        = "${var.application_name}-efs-sg"
  description = "EFS mount targets: NFS port 2049 from ECS task SGs only"
  vpc_id      = var.vpc_id

  # dynamic block: no ingress rule created when allowed_sg_ids is empty (Phase 2).
  # Phase 3 populates allowed_sg_ids with api-tasks and tools-tasks SG IDs.
  dynamic "ingress" {
    for_each = length(var.allowed_sg_ids) > 0 ? [1] : []
    content {
      description     = "NFS from ECS task security groups"
      from_port       = 2049
      to_port         = 2049
      protocol        = "tcp"
      security_groups = var.allowed_sg_ids
    }
  }

  tags = merge(var.tags, { Name = "sg-efs" })
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# EFS File System
# Encrypted, KMS-managed, bursting throughput
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_efs_file_system" "main" {
  creation_token   = "${var.application_name}-efs"
  encrypted        = true
  kms_key_id       = var.kms_key_arn
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = merge(var.tags, { Name = "efs-${var.application_name}" })
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# EFS Mount Targets — one per private subnet
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_efs_mount_target" "main" {
  count           = length(var.private_subnets)
  file_system_id  = aws_efs_file_system.main.id
  subnet_id       = var.private_subnets[count.index]
  security_groups = [aws_security_group.efs.id]
}

# ## ## ## ## ## ## ## ## ## ## ## ## ## ## #
# EFS Access Points
# # ## ## ## ## ## ## ## ## ## ## ## ## ## ##

resource "aws_efs_access_point" "mongodb" {
  file_system_id = aws_efs_file_system.main.id

  root_directory {
    path = "/mongodb-data"
    creation_info {
      owner_uid   = 999 # mongodb user in mongo:8.0-noble
      owner_gid   = 999
      permissions = "755"
    }
  }

  posix_user {
    uid = 999
    gid = 999
  }

  tags = merge(var.tags, { Name = "efs-ap-mongodb" })
}

resource "aws_efs_access_point" "postgres" {
  file_system_id = aws_efs_file_system.main.id

  root_directory {
    path = "/postgres-data"
    creation_info {
      owner_uid   = 70 # postgres user in postgres:18-alpine
      owner_gid   = 70
      permissions = "700"
    }
  }

  posix_user {
    uid = 70
    gid = 70
  }

  tags = merge(var.tags, { Name = "efs-ap-postgres" })
}
