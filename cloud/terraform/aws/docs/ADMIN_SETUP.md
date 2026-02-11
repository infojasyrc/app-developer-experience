# AWS Terraform Backend: Admin Setup Guide

> This document explains the one-time administrative setup required to provision and secure the shared Terraform backend (S3 + DynamoDB + IAM) and how to hand off credentials to regular Terraform users. It is based on the Makefile targets in this directory.

## 0. Purpose

We use an S3 bucket for remote Terraform state storage and a DynamoDB table for state locking to prevent concurrent mutations. A dedicated least‑privilege IAM user is created for Terraform operations (init/plan/apply/destroy). Admins perform bootstrap once; thereafter regular users only need the generated credentials.

## 1. Prerequisites (Admin Workstation / CI Runner)
Ensure the following are installed and configured with admin‑level AWS credentials (an IAM principal allowed to create IAM users, policies, S3 buckets, DynamoDB tables):

- AWS CLI v2 (`aws --version`)
- Terraform >= 1.5 (`terraform version`)
- Make (GNU Make)

Network / permissions required:
- iam:CreateUser, iam:CreatePolicy, iam:AttachUserPolicy, iam:CreateAccessKey
- s3:CreateBucket, s3:PutBucketVersioning, s3:PutBucketTagging, s3:PutPublicAccessBlock
- dynamodb:CreateTable

## 2. Environment Configuration

The Makefile auto‑loads either `.env` (private) or falls back to `.env.public`. Create a private `.env` file before running admin tasks.

Example `.env` (do NOT commit):

```md
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
IAM_USER_NAME=terraform-ci
# Optionally override bucket/table names if you don't use defaults:
# TF_STATE_BUCKET=my-tf-state-bucket-2025-unique
# TF_LOCK_TABLE=my-terraform-lock-table
# IAM_POLICY_NAME=TerraformBackendPolicy
```

Variables used:
- `AWS_REGION`: Region for backend resources
- `AWS_ACCOUNT_ID`: Your AWS account ID (used in policy ARN construction)
- `IAM_USER_NAME`: Name of least-privilege Terraform user
- `TF_STATE_BUCKET`: Remote state bucket (must be globally unique)
- `TF_LOCK_TABLE`: DynamoDB lock table name
- `IAM_POLICY_NAME`: Name of IAM policy storing backend access rules
- `IAM_POLICY_FILE`: JSON policy document file (default: `terraform-backend-policy.json`)
- `BACKEND_CONFIG`: Local backend config file consumed by `terraform init` (`backend.conf` – keep out of version control)

## 3. Prepare IAM Policy Document
Create `terraform-backend-policy.json` in this directory (not provided by default). Replace placeholders with your real bucket and table names plus account ID.

Example policy (least privilege for state + locking):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3StateAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-tf-state-bucket-2025-unique",
        "arn:aws:s3:::my-tf-state-bucket-2025-unique/*"
      ]
    },
    {
      "Sid": "DynamoDBLocking",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/my-terraform-lock-table"
    }
  ]
}
```

> Keep this file under version control only if acceptable for your governance; otherwise store it centrally and reference locally.

## 4. Backend Config File (`backend.conf`)

Create a local (ignored) file named `backend.conf` used by `terraform init -backend-config=backend.conf`.

Example:

```md
bucket         = "my-tf-state-bucket-2025-unique"
region         = "us-east-1"
dynamodb_table = "my-terraform-lock-table"
key            = "global/terraform.tfstate"
encrypt        = true
```

Add `backend.conf` to `.gitignore` (already noted in Makefile comment). Keep the state key structure consistent (e.g., `env/app/terraform.tfstate`) if you later use multiple environments.

## 5. One-Time Admin Bootstrap Sequence

Run the following Make targets from this directory:

### Option A (Recommended): Single aggregated target

```bash
# creates s3 bucket (versioning, public access block, tagging), dynamo db lock for state locking, and iam user + policy
make setup-backend
```

### Option B: Manual step-by-step

```bash
make create-bucket
make create-lock-table
make create-policy
make create-user
make attach-policy
```

### Generate Access Keys (final admin step)

```bash
make create-keys
```
Output includes `AccessKeyId` and `SecretAccessKey` (secret shown ONLY once). Securely store these:
- Password manager (org vault)
- CI/CD secret store (GitHub Actions, etc.)
- Never commit or email them

After this, you can hand off credentials to Terraform users (or inject into CI).

---
## 6. Hand-Off to Terraform User / Developer

Terraform users require:
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from the created access key
- `AWS_REGION` (same region as backend resources)

Export variables (example macOS/Linux shell):
```bash
export AWS_ACCESS_KEY_ID=AKIA...REDACTED
export AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export AWS_REGION=us-east-1
```

Initialize Terraform:

```bash
make init
make plan
make apply
# destroy (careful):
make destroy
```

## 7. Help / Discoverability

List available targets:

```bash
make help
```
(The Makefile prints descriptive names with emojis for quick scanning.)

## 8. Security & Compliance Notes
- S3 bucket public access is blocked; versioning enabled for state recovery.
- DynamoDB provisioned throughput is minimal (1/1); adjust if high concurrency.
- Rotate access keys periodically (quarterly recommended). Use `aws iam delete-access-key` then `make create-keys` for new key.
- Consider migrating to AWS IAM Roles + OIDC federation for CI (GitHub Actions) instead of static keys.
- Tagging: Extend bucket tags for cost allocation (`Environment`, `Owner`, `CostCenter`).
- Policy scope: If multiple state buckets/tables emerge, consider grouping via specific ARNs or using condition keys.

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `AccessDenied` during `terraform init` | Missing/incorrect IAM policy or wrong keys | Re-check policy JSON and attached user; verify exported credentials. |
| `NoSuchBucket` | Bucket name mismatch | Confirm bucket name in `backend.conf`. |
| `ConditionalCheckFailedException` in DynamoDB | Concurrent Terraform applies | Let previous apply finish; locking works as designed. |
| State not updating | Wrong backend config or local state | Re-run `make init` after fixing `backend.conf`. |

## 10. Cleanup (If Decommissioning Backend)
Order matters to avoid orphaned locks:
1. Ensure no active Terraform operations.
2. Delete all objects (including versions) from S3 bucket (use lifecycle rules or a script).
3. Delete DynamoDB table: `aws dynamodb delete-table --table-name <TF_LOCK_TABLE>`.
4. Detach and delete IAM policy: `aws iam detach-user-policy ...` then `aws iam delete-policy ...`.
5. Delete IAM access keys: `aws iam list-access-keys --user-name <IAM_USER_NAME>` then `aws iam delete-access-key ...`.
6. Delete IAM user: `aws iam delete-user --user-name <IAM_USER_NAME>`.
7. Delete S3 bucket: `aws s3api delete-bucket --bucket <TF_STATE_BUCKET>`.

> Always confirm with stakeholders and backups before destroying shared state infrastructure.

## 11. Next Improvements (Optional)

- Introduce environment-specific buckets (`tf-state-prod`, `tf-state-dev`) and table partitioning.
- Add CI automation: run `make plan` on PR, `make apply` on main merges.
- Replace static keys with AWS IAM Role via GitHub OIDC provider.
- Add encryption-by-default enforcement or bucket policy requiring TLS.

## 12. Quick Reference (Targets)

| Target | Role | Description |
|--------|------|-------------|
| `setup-backend` | Admin | Orchestrates bucket, lock table, user + policy attach |
| `create-bucket` | Admin | Creates & secures S3 state bucket |
| `create-lock-table` | Admin | Creates DynamoDB lock table |
| `create-policy` | Admin | Creates IAM policy from JSON file |
| `create-user` | Admin | Creates IAM user for Terraform |
| `attach-policy` | Admin | Attaches policy to user (depends on create-user & create-policy) |
| `create-keys` | Admin | Generates & prints access keys (one-time secret) |
| `init` | TF User | Initializes Terraform backend |
| `plan` | TF User | Generates execution plan |
| `apply` | TF User | Applies changes |
| `destroy` | TF User | Destroys managed resources |
| `help` | Any | Lists available targets |

## 13. Verification Checklist (Post-Setup)
- [ ] S3 bucket exists with versioning and tags
- [ ] DynamoDB table exists with correct primary key (LockID)
- [ ] IAM policy created with correct ARNs
- [ ] IAM user created & policy attached
- [ ] Access keys captured securely
- [ ] `backend.conf` present locally (ignored)
- [ ] `make init` succeeds with remote state configuration


## 14. FAQs

**Q: Can multiple teams share this backend?** Yes, but segregate state keys (e.g., `teamA/app1/terraform.tfstate`). Consider separate buckets for stricter isolation.

**Q: What if someone loses the SecretAccessKey?** Create a new access key and disable/delete the old one; you cannot recover a lost secret.

**Q: How do we enable encryption at rest?** S3 default SSE is recommended (can enforce via bucket policy). DynamoDB encryption is enabled automatically.

**Q: Should we enable bucket lifecycle policies?** Yes, optionally to prune old object versions after retention window.

**Q: What is the specific command to update policies?** Run `make update-policy`.
