# Keycloak SSO — Implementation Plan

## Production Secrets Management

### The problem with the dev realm JSON in production

The dev realm JSON commits two things that must never reach production:

1. **Hardcoded client secrets** (`"secret": "grafana-client-secret"`) — predictable, committed to git
2. **Seeded test users with plaintext passwords** — must not exist in production

The production approach separates these concerns into three independent mechanisms.

### 1 — Remove hardcoded secrets from the realm JSON (use env interpolation)

Keycloak supports `${env.VARIABLE_NAME}` interpolation inside realm import JSON. Replace the hardcoded `secret` fields:

```json
{
  "clientId": "grafana",
  "secret": "${env.KC_GRAFANA_CLIENT_SECRET}",
  ...
}
```

```json
{
  "clientId": "unleash",
  "secret": "${env.KC_UNLEASH_CLIENT_SECRET}",
  ...
}
```

Then inject the actual secrets into the Keycloak container at deploy time (see 8.2). The realm JSON committed to git contains only placeholders — no secrets.

### 2 — Secret injection at deploy time

**AWS deployments (ECS / EKS)**

Store secrets in AWS Secrets Manager:
```
/conference-manager/keycloak/admin-password
/conference-manager/keycloak/grafana-client-secret
/conference-manager/keycloak/unleash-client-secret
```

Reference them as environment variables in the ECS task definition or Kubernetes Secret:
```json
{
  "name": "KC_GRAFANA_CLIENT_SECRET",
  "valueFrom": "arn:aws:secretsmanager:region:account:secret:/conference-manager/keycloak/grafana-client-secret"
}
```

Keycloak receives `KC_GRAFANA_CLIENT_SECRET` at startup and interpolates it into the realm JSON via `${env.KC_GRAFANA_CLIENT_SECRET}`.

**Grafana and Unleash** also need the same secret at their side. Inject `KEYCLOAK_GRAFANA_CLIENT_SECRET` and `KEYCLOAK_UNLEASH_CLIENT_SECRET` into their respective containers from the same Secrets Manager entries. This ensures client ID + secret are always in sync.

**CI/CD pipeline**

The GitHub Actions workflow that deploys infrastructure must:
1. Retrieve secrets from Secrets Manager (or GitHub Encrypted Secrets for dev-level rotation)
2. Pass them as environment variables to the deploy command (Terraform, `docker compose`, Helm)
3. Never print or log secret values — use `::add-mask::` in GitHub Actions

```yaml
- name: Deploy stack
  env:
    KC_GRAFANA_CLIENT_SECRET: ${{ secrets.KEYCLOAK_GRAFANA_CLIENT_SECRET }}
    KC_UNLEASH_CLIENT_SECRET: ${{ secrets.KEYCLOAK_UNLEASH_CLIENT_SECRET }}
  run: make deploy-prod
```

**HashiCorp Vault (alternative)**

If Vault is already in the stack, use the Vault Agent Sidecar or the Keycloak Vault SPI to inject secrets directly from Vault paths at container startup, avoiding environment variables entirely.

### 3 — Never commit the production realm JSON

The dev realm JSON (`conference-manager-realm.json`) is committed to git. It contains test users and hardcoded secrets — both acceptable for development only. For production:

```
tools/keycloak/realms/
  conference-manager-realm.json          ← dev: committed, test users, hardcoded secrets
  conference-manager-realm.prod.json     ← prod template: NO users, secrets are ${env.*}
```

Add `*.prod.json` to `.gitignore` if you want to prevent accidental commits of a populated prod file. Alternatively, keep both files in git since the prod template only contains `${env.*}` placeholders — no real secrets.

---

## Production User and Role Management

### 1 — No users in production realm JSON

The dev realm JSON seeds `dev-admin` and `dev-viewer` for convenience. Production realm exports must have an empty `"users": []` array. Users are never seeded via JSON in production.

### 2 — User provisioning options (choose one per environment)

**Option A — Keycloak Admin Console (small teams, < 20 users)**

An infrastructure admin creates users manually in the Keycloak Admin Console (`/admin`). Assign realm roles (`grafana-admin`, `unleash-admin`, etc.) directly on the user. This is the simplest approach but does not scale and has no audit trail beyond Keycloak's own event log.

**Option B — Keycloak Admin REST API (automated onboarding)**

When a new team member joins, a script or internal tool calls the Keycloak Admin API:

```bash
# 1. Get admin token
TOKEN=$(curl -s -X POST \
  "http://keycloak:8080/realms/master/protocol/openid-connect/token" \
  -d "client_id=admin-cli&grant_type=password&username=${KC_ADMIN}&password=${KC_ADMIN_PASS}" \
  | jq -r '.access_token')

# 2. Create user
curl -s -X POST \
  "http://keycloak:8080/admin/realms/conference-manager-tools/users" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jdoe",
    "email": "jdoe@company.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "enabled": true,
    "emailVerified": true
  }'

# 3. Assign role
USER_ID=$(curl -s "http://keycloak:8080/admin/realms/conference-manager-tools/users?username=jdoe" \
  -H "Authorization: Bearer ${TOKEN}" | jq -r '.[0].id')

ROLE=$(curl -s "http://keycloak:8080/admin/realms/conference-manager-tools/roles/grafana-admin" \
  -H "Authorization: Bearer ${TOKEN}")

curl -s -X POST \
  "http://keycloak:8080/admin/realms/conference-manager-tools/users/${USER_ID}/role-mappings/realm" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "[${ROLE}]"
```

Store this script in `tools/keycloak/scripts/add-user.sh`. It should read credentials from environment variables, never from arguments.

**Option C — LDAP / Active Directory federation (large teams, enterprise)**

Keycloak can federate an existing corporate directory (LDAP, AD) as a User Storage Provider. Users authenticate against their corporate credentials. Keycloak maps LDAP groups to realm roles via Group Mappers. No user management in Keycloak itself — the directory is the source of truth. Configuration is done via the Keycloak admin console under **User Federation**.

This option is recommended if the organisation already has an AD/LDAP directory.

### 3 — Role management best practices

| Practice | Rationale |
|----------|-----------|
| Roles are defined in the realm JSON and committed to git | Roles are structural config, not secrets. IaC applies them. |
| Users are never in the realm JSON (production) | Users are runtime data, not code. |
| Use Keycloak Groups to bundle roles | Assign a user to a Group (`ops-team`) rather than individual roles. The Group carries the role assignments. Role changes affect all group members automatically. |
| One realm per environment, not per service | `conference-manager-tools-dev`, `conference-manager-tools-staging`, `conference-manager-tools-prod`. Keeps clients isolated — a misconfigured dev client cannot affect prod. |
| Keycloak's own admin console is protected by its own realm (`master`) | Use a dedicated admin service account, not the bootstrap admin credentials, for automation. Rotate bootstrap credentials after first deploy. |
| Enable Keycloak event logging | Admin console → Events → Config → Enable `LOGIN`, `LOGIN_ERROR`, `ADMIN` event types. Ship logs to the same observability stack (Prometheus / Grafana). |

### 4 — Keycloak realm as Infrastructure as Code (Terraform)

For full auditability, use the [Keycloak Terraform provider](https://registry.terraform.io/providers/mrparkers/keycloak/latest/docs) to manage realms, clients, and roles declaratively:

```hcl
resource "keycloak_realm" "conference_manager" {
  realm   = "conference-manager-tools"
  enabled = true
}

resource "keycloak_openid_client" "grafana" {
  realm_id              = keycloak_realm.conference_manager.id
  client_id             = "grafana"
  client_secret         = var.grafana_client_secret   # from Terraform variable / vault
  access_type           = "CONFIDENTIAL"
  standard_flow_enabled = true
  valid_redirect_uris   = ["https://grafana.yourdomain.com/*"]
}

resource "keycloak_role" "grafana_admin" {
  realm_id = keycloak_realm.conference_manager.id
  name     = "grafana-admin"
}
```

`var.grafana_client_secret` is a sensitive Terraform variable populated from:
- `TF_VAR_grafana_client_secret` environment variable in CI/CD
- AWS Secrets Manager via `data "aws_secretsmanager_secret_version"`
- Vault via `data "vault_generic_secret"`

The Terraform state (which contains the secret) must be stored in a remote backend with encryption at rest (S3 + DynamoDB lock, or Terraform Cloud).
