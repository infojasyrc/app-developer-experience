# Basic Components

## Creating the ECR repositories

You can automate ECR repository creation with the provided make targets (run as an AWS admin capable of creating ECR repositories):

```bash
# From cloud/terraform/aws
make create-ecr-frontend
make create-ecr-backend
```

Print the values to place into `terraform.tfvars`:

```bash
make print-ecr-values
```

Example snippet to add (replace if you override names):

```hcl
ecr_frontend = "123456789012.dkr.ecr.us-west-1.amazonaws.com/frontend"
ecr_backend  = "123456789012.dkr.ecr.us-west-1.amazonaws.com/backend"
```

Login to the registry (developers who need to build & push images):

```bash
make ecr-login
```

Then build & push (example commands, adapt the paths):

```bash
docker build -t 123456789012.dkr.ecr.us-west-1.amazonaws.com/frontend:latest path/to/webapp
docker push 123456789012.dkr.ecr.us-west-1.amazonaws.com/frontend:latest

docker build -t 123456789012.dkr.ecr.us-west-1.amazonaws.com/backend:latest path/to/backend
docker push 123456789012.dkr.ecr.us-west-1.amazonaws.com/backend:latest
```