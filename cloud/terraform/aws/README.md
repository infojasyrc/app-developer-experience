# Infrastructure as Code for AWS

This is a demo for IaC with Terraform to show an [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## Contents

- [Infrastructure as Code for AWS](#infrastructure-as-code-for-aws)
- [Contents](#contents)
- [Admin setup](./docs/ADMIN_SETUP.md)
- [Cloud Deployment](#cloud-deployment)
  - [Elements to Deploy](#elements-to-deploy)
  - [Basic Network Setups](#basic-network-setups)
- [Project Dependencies](#project-dependencies)
- [Using Terraform](#using-terraform)
- [Project Requirements](#project-requirements-for-standalone-deployment)
- [Links](#links)
- [Troubleshooting](#troubleshooting)

## Cloud Deployment

We will use [ECS](https://aws.amazon.com/ecs/) for this deployment.

We have developed this project as a multi container application so schedulers are a great deployment choice.

This example might give you some ideas of your own deployment process.

### Elements to deploy

This is a project to show auto scale feature in AWS ECS, considering:

- Load Balancer
- Public and Private network
- Security Groups
- AWS RDS and Read Replicas
- Route53 to handle the subdomains
- AWS ECS, AWS ECR, AWS Cluster and ASG
- IAm, Roles and Policies
- AWS Cloudwatch

### Basic Network Setups

As part of CI/CD, this project deploy into Amazon ECS with a private/public subnet configuration CI/CD

In this configuration:

- The application containers are deployed into a private subnet with _egress-only_ internet access through a [NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html).
- User access requests come through an Amazon [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html) that sits within the public subnet.
- Security groups are maintained at both the load balancer level and the application container level. Network communication between containers is managed internally by the container scheduler service, in this case ECS.
- Code changes happen through an _immutable image deployment_ so there is no need for a live SSH connection into running containers. This reduces the vulnerable attack surface and also simplifies deployment operations.

## Project Dependencies

- [Terraform Workspaces](https://www.terraform.io/docs/language/state/workspaces.html)

## Using Terraform

Create the specific environment: (as an example for dev)

```bash
terraform workspace new dev
```

Select the specific environment: (as an example for dev)

```bash
terraform workspace select dev
```

Run plan for execution. As an example, the expected plan would be called: 20210907_01_update_core_infrastructure.

On Linux or MacOS:

```bash
terraform plan --out=20210907_01_Update_core_infrastructure -var-file=terraform.dev.tfvars
```

On Windows:

```powershell
terraform plan --out 20210907_01_Update_core_infrastructure -var-file terraform.dev.tfvars
```

Apply specific execution plan

```bash
terraform apply "20210907_01_Update_core_infrastructure"
```

## Project Requirements for standalone deployment

1. Buy and register a domain in AWS Route53 or migrate from a domain service (example: GoDaddy)
2. Use AWS ACM to generate a wildcard certificate
3. Create a container registry (ECR) to deploy frontend container
4. Create a container registry (ECR) to deploy backend container

## Links

- https://eazytutorial.com/index.php/2021/10/23/aws-certificate-manager-create-a-ssl-certificate-for-a-godaddy-domain/
- https://www.radishlogic.com/aws/using-godaddy-domain-in-aws-route-53/
- https://antmedia.io/ssl-from-aws-certificate-manager-for-domain-name/
- https://www.radishlogic.com/aws/creating-a-public-ssl-tls-certificate-in-aws-certificate-manager/

## Troubleshooting
