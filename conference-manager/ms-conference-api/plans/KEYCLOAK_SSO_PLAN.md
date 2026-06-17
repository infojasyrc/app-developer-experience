# Keycloak SSO — Implementation Plan

**Target:** Add Keycloak as the Identity Provider (IdP) for Single Sign-On across Grafana and Unleash in the local development stack (`make launch-local-dev`).

**Scope:** Infrastructure only — no changes to NestJS API business logic. The API continues to use Firebase auth. Keycloak SSO applies to the observability and feature-flag tooling tier.

---

## Current State

| Service   | Port | Auth today              |
|-----------|------|-------------------------|
| Grafana   | 3000 | Static admin/password (`GF_SECURITY_ADMIN_PASSWORD=admin`) |
| Unleash   | 4242 | Local admin/password (`UNLEASH_DEFAULT_ADMIN_*`) |
| Prometheus| 9090 | No auth (internal only) |
| NestJS API| 5002 | Firebase JWT (`firebase-auth` Passport strategy) |
| MongoDB   | 27017| Root username/password |

All services share the Docker network `ms-conference-network`.

---

## Target State

```
Browser
  │
  ├─→ Grafana :3000  ──OIDC──→  Keycloak :8080
  │                                   │
  └─→ Unleash :4242  ──OIDC──→  Keycloak :8080
                                      │
                               Realm: conference-manager
                               Clients: grafana, unleash
```

Keycloak acts as the single source of identity. Users log in once and gain access to both tools through the same session.

---

## Phase 1 — Add Keycloak to Docker Compose

### File: `docker-compose/docker-compose.keycloak.yml` (new)

```yaml
---

services:
  keycloak:
    container_name: ${COMPOSE_PROJECT_NAME}-keycloak
    image: quay.io/keycloak/keycloak:26.2
    platform: ${PLATFORM}
    restart: unless-stopped
    command: start-dev --import-realm
    environment:
      - KC_BOOTSTRAP_ADMIN_USERNAME=${KEYCLOAK_ADMIN_USERNAME}
      - KC_BOOTSTRAP_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
      - KC_HTTP_PORT=8080
      - KC_HOSTNAME_STRICT=false
      - KC_HOSTNAME_STRICT_HTTPS=false
      - KC_HTTP_ENABLED=true
    ports:
      - 8080:8080
    volumes:
      - ../tools/keycloak/realms:/opt/keycloak/data/import
    healthcheck:
      test: ['CMD-SHELL', 'curl -sf http://localhost:8080/realms/master || exit 1']
      interval: 15s
      timeout: 10s
      retries: 10
      start_period: 60s

networks:
  default:
    name: ${COMPOSE_PROJECT_NAME}-network
```

**Why `start-dev`:** Development mode removes TLS requirements and exposes a browser-accessible admin console at `http://localhost:8080`. Never use in production.

**Why `--import-realm`:** Keycloak auto-imports any realm JSON placed in `/opt/keycloak/data/import` on first boot. This enables reproducible environments without manual UI clicks.

### Update `launch-local-dev` in Makefile

```makefile
launch-local-dev: ## 🚀 Launch API + DB + Feature Toggles + IdP (development stack)
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.unleash.yml \
		-f docker-compose/docker-compose.keycloak.yml \
		-f docker-compose/docker-compose.tools.yml \
		-f docker-compose/docker-compose.local.dev.api.yml up

stop-local-dev: ## 🛑 Stop development stack
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f docker-compose/docker-compose.db.yml \
		-f docker-compose/docker-compose.unleash.yml \
		-f docker-compose/docker-compose.keycloak.yml \
		-f docker-compose/docker-compose.tools.yml \
		-f docker-compose/docker-compose.local.dev.api.yml down
```

### New standalone Makefile targets

```makefile
launch-keycloak: ## 🔐 Launch Keycloak IdP standalone
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.keycloak.yml up

stop-keycloak: ## 🛑 Stop Keycloak IdP
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.keycloak.yml down

reset-keycloak: ## 🗑️ Stop Keycloak and remove its data (re-imports realm on next start)
	docker compose --env-file $(ENV_FILE) -f docker-compose/docker-compose.keycloak.yml down -v
```

Also add to the `.PHONY` list: `launch-keycloak stop-keycloak reset-keycloak`.

### Volume — clarification

**No named volume is needed for Keycloak in development.** In `start-dev` mode Keycloak uses an embedded H2 database. Intentionally keeping it ephemeral means every `reset-keycloak` gives a clean slate and the realm JSON is always re-imported, which is the desired local-dev behaviour. Do **not** add a Keycloak entry to `create-volumes`.

If a developer makes manual changes in the Keycloak UI and wants them to survive a container restart *without* resetting, they can add a bind-mount to the compose file temporarily — but the canonical state must always be in the realm JSON, not in the container.

---

## Phase 2 — Keycloak Realm Configuration (Import File)

### File: `tools/keycloak/realms/conference-manager-tools-realm.json` (new)

This file is imported automatically on first boot. It provisions the entire realm including clients and test users.

```json
{
  "realm": "conference-manager-tools",
  "enabled": true,
  "displayName": "Conference Manager",
  "sslRequired": "none",
  "registrationAllowed": false,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "roles": {
    "realm": [
      { "name": "grafana-admin", "description": "Full Grafana Admin" },
      { "name": "grafana-editor", "description": "Grafana Editor" },
      { "name": "grafana-viewer", "description": "Grafana read-only viewer" },
      { "name": "unleash-admin", "description": "Full Unleash Admin" },
      { "name": "unleash-viewer", "description": "Unleash read-only viewer" }
    ]
  },
  "clients": [
    {
      "clientId": "grafana",
      "name": "Grafana",
      "enabled": true,
      "protocol": "openid-connect",
      "publicClient": false,
      "secret": "grafana-client-secret",
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"],
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": false,
      "attributes": {
        "access.token.lifespan": "3600"
      },
      "protocolMappers": [
        {
          "name": "realm-roles-mapper",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        }
      ]
    },
    {
      "clientId": "unleash",
      "name": "Unleash",
      "enabled": true,
      "protocol": "openid-connect",
      "publicClient": false,
      "secret": "unleash-client-secret",
      "redirectUris": ["http://localhost:4242/*"],
      "webOrigins": ["http://localhost:4242"],
      "standardFlowEnabled": true,
      "directAccessGrantsEnabled": false,
      "protocolMappers": [
        {
          "name": "realm-roles-mapper",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        }
      ]
    }
  ],
  "users": [
    {
      "username": "dev-admin",
      "email": "dev-admin@conference-manager.local",
      "firstName": "Dev",
      "lastName": "Admin",
      "enabled": true,
      "emailVerified": true,
      "credentials": [
        {
          "type": "password",
          "value": "admin1234",
          "temporary": false
        }
      ],
      "realmRoles": ["grafana-admin", "unleash-admin"]
    },
    {
      "username": "dev-viewer",
      "email": "dev-viewer@conference-manager.local",
      "firstName": "Dev",
      "lastName": "Viewer",
      "enabled": true,
      "emailVerified": true,
      "credentials": [
        {
          "type": "password",
          "value": "viewer1234",
          "temporary": false
        }
      ],
      "realmRoles": ["grafana-viewer", "unleash-viewer"]
    }
  ]
}
```

**Important:** `secret` values in a realm export are plain text for development only. In production, generate secrets with `openssl rand -base64 32` and inject them via environment variables or a secrets manager.

---

## Phase 3 — Grafana OIDC SSO Configuration

Grafana supports Generic OAuth2 / OIDC natively. Configuration is injected via environment variables in the Docker Compose service.

### Update `docker-compose/docker-compose.tools.yml`

Replace the `ob-grafana` service definition:

```yaml
ob-grafana:
  container_name: ${COMPOSE_PROJECT_NAME}-ob-grafana
  image: grafana/grafana
  platform: ${PLATFORM}
  restart: always
  ports:
    - 3000:3000
  volumes:
    - grafana-data:/var/lib/grafana
    - ../tools/grafana/provisioning:/etc/grafana/provisioning
  environment:
    # Keep local fallback admin in case SSO is misconfigured
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    # Generic OAuth / OIDC (Keycloak)
    - GF_AUTH_GENERIC_OAUTH_ENABLED=true
    - GF_AUTH_GENERIC_OAUTH_NAME=Keycloak SSO
    - GF_AUTH_GENERIC_OAUTH_ALLOW_SIGN_UP=true
    - GF_AUTH_GENERIC_OAUTH_CLIENT_ID=grafana
    - GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET=${KEYCLOAK_GRAFANA_CLIENT_SECRET}
    - GF_AUTH_GENERIC_OAUTH_SCOPES=openid email profile roles
    # Internal Docker network URLs (container-to-container)
    - GF_AUTH_GENERIC_OAUTH_AUTH_URL=http://localhost:8080/realms/conference-manager/protocol/openid-connect/auth
    - GF_AUTH_GENERIC_OAUTH_TOKEN_URL=http://${COMPOSE_PROJECT_NAME}-keycloak:8080/realms/conference-manager/protocol/openid-connect/token
    - GF_AUTH_GENERIC_OAUTH_API_URL=http://${COMPOSE_PROJECT_NAME}-keycloak:8080/realms/conference-manager/protocol/openid-connect/userinfo
    - GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH=contains(roles[*], 'grafana-admin') && 'Admin' || contains(roles[*], 'grafana-editor') && 'Editor' || 'Viewer'
    - GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_STRICT=false
    # Server URL used for OAuth redirect — must be browser-accessible
    - GF_SERVER_ROOT_URL=http://localhost:3000
  depends_on:
    ob-prometheus:
      condition: service_healthy
    keycloak:
      condition: service_healthy
```

**URL split reason:**  
`AUTH_URL` must be browser-accessible (`localhost:8080`) because the browser initiates the redirect. `TOKEN_URL` and `API_URL` are server-side calls from Grafana container to Keycloak container, so they use the internal Docker service name.

---

## Phase 4 — Unleash OIDC SSO Configuration

Unleash OSS v5+ supports OIDC SSO. Configuration is done via the Unleash admin UI (Settings → SSO) after first boot, because Unleash stores SSO config in its PostgreSQL database. An alternative is to bootstrap it via the Unleash API on startup.

### Option A — UI Configuration (manual, one-time)

After `make launch-local-dev`:
1. Open `http://localhost:4242` and log in with `UNLEASH_DEFAULT_ADMIN_*` credentials
2. Navigate to **Admin → Single Sign-On → OpenID Connect**
3. Set the following values:

| Field | Value |
|-------|-------|
| Discover URL | `http://ms-conference-keycloak:8080/realms/conference-manager/.well-known/openid-configuration` |
| Client ID | `unleash` |
| Client Secret | `unleash-client-secret` |
| Enable PKCE | Yes |
| Auto-create users | Yes |
| Default role | Viewer |

4. Map roles: Add a role mapping — Keycloak role `unleash-admin` → Unleash role `Admin`

### Option B — Bootstrap Script (recommended, automated)

Create `tools/keycloak/scripts/configure-unleash-sso.sh`:

```bash
#!/bin/sh
# Wait for Unleash to be ready
until curl -sf http://localhost:4242/health > /dev/null; do
  echo "Waiting for Unleash..."
  sleep 5
done

UNLEASH_URL="http://localhost:4242"
ADMIN_USER="${UNLEASH_DEFAULT_ADMIN_USERNAME:-admin}"
ADMIN_PASS="${UNLEASH_DEFAULT_ADMIN_PASSWORD:-unleash}"

# Get admin token
TOKEN=$(curl -sf -X POST "${UNLEASH_URL}/auth/simple" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}" \
  | jq -r '.token')

# Configure OIDC SSO
curl -sf -X POST "${UNLEASH_URL}/api/admin/auth/oidc/settings" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "discoverUrl": "http://ms-conference-keycloak:8080/realms/conference-manager/.well-known/openid-configuration",
    "clientId": "unleash",
    "clientSecret": "'"${KEYCLOAK_UNLEASH_CLIENT_SECRET}"'",
    "enableSingleSignOut": true,
    "autoCreate": true,
    "unleashHostname": "localhost:4242",
    "defaultRootRole": "Viewer",
    "emailDomains": ""
  }'

echo "Unleash OIDC SSO configured."
```

Add a Makefile target:

```makefile
configure-unleash-sso: ## 🔐 Apply Keycloak OIDC settings to Unleash via API
	@chmod +x ./tools/keycloak/scripts/configure-unleash-sso.sh
	@./tools/keycloak/scripts/configure-unleash-sso.sh
```

---

## Phase 5 — Environment Variables

### Which variables are actually required?

| Variable | Required for local dev? | Required for production? | Notes |
|----------|------------------------|--------------------------|-------|
| `KEYCLOAK_ADMIN_USERNAME` | Yes | Yes | Bootstrap admin for Keycloak itself |
| `KEYCLOAK_ADMIN_PASSWORD` | Yes | Yes | Must be strong in prod |
| `KEYCLOAK_GRAFANA_CLIENT_SECRET` | **No** | Yes | In dev the realm JSON hardcodes `grafana-client-secret`; env var only needed when the JSON reads `${env.KC_GRAFANA_SECRET}` |
| `KEYCLOAK_UNLEASH_CLIENT_SECRET` | **No** | Yes | Same — hardcoded in dev realm JSON |
| `KEYCLOAK_REALM` | **No** | **No** | Cosmetic — the realm name is already baked into all `AUTH_URL` / `TOKEN_URL` values. Only useful if you want a single source of truth for tooling scripts |
| `GRAFANA_ADMIN_PASSWORD` | Yes | Yes | Emergency local admin fallback in Grafana |

### Add to `.env.public` (only variables that change behaviour in dev)

```dotenv
# --- Keycloak IdP ---
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Grafana fallback admin (kept alongside OIDC as emergency access)
GRAFANA_ADMIN_PASSWORD=admin
```

`KEYCLOAK_GRAFANA_CLIENT_SECRET`, `KEYCLOAK_UNLEASH_CLIENT_SECRET`, and `KEYCLOAK_REALM` are **not** added to `.env.public` because they have no effect in development — the realm JSON is the single source of truth for client secrets in dev.

### Production secrets management

See Phase 8 below for the full production process.

---

## Phase 6 — Directory Structure

```
conference-manager/ms-conference-api/
├── docker-compose/
│   ├── docker-compose.db.yml          (existing)
│   ├── docker-compose.unleash.yml     (existing)
│   ├── docker-compose.tools.yml       (modified — Grafana OIDC env vars + Keycloak dependency)
│   ├── docker-compose.local.dev.api.yml (existing)
│   └── docker-compose.keycloak.yml    (NEW)
│
├── tools/
│   ├── prometheus.yml                 (existing)
│   ├── grafana/                       (existing)
│   │   └── provisioning/
│   │       └── datasources/
│   │           └── prometheus.yml     (existing)
│   └── keycloak/                      (NEW)
│       ├── realms/
│       │   └── conference-manager-realm.json  (NEW — auto-imported on boot)
│       └── scripts/
│           └── configure-unleash-sso.sh       (NEW — optional bootstrap)
│
├── plans/
│   └── KEYCLOAK_SSO_PLAN.md           (this file)
│
└── Makefile                           (modified — new targets + updated launch-local-dev)
```

---

## Phase 7 — Implementation Order

Execute in this sequence to avoid dependency failures:

```
Step 1  Create tools/keycloak/realms/conference-manager-realm.json
Step 2  Create docker-compose/docker-compose.keycloak.yml
Step 3  Update .env.public with Keycloak variables
Step 4  Update docker-compose/docker-compose.tools.yml (Grafana OIDC env vars)
Step 5  Update Makefile (new targets, updated launch-local-dev / stop-local-dev)
Step 6  make create-volumes          ← adds Keycloak volume
Step 7  make build-dev               ← rebuild if needed
Step 8  make launch-local-dev        ← starts all services including Keycloak
Step 9  Verify Keycloak at http://localhost:8080/admin (realm "conference-manager" should exist)
Step 10 Verify Grafana SSO at http://localhost:3000 (click "Sign in with Keycloak SSO")
Step 11 Run configure-unleash-sso or configure manually in Unleash admin UI
Step 12 Verify Unleash SSO at http://localhost:4242 (OIDC redirect to Keycloak)
```

---

## Known Constraints & Decisions

| Decision | Rationale |
|----------|-----------|
| Keycloak `start-dev` mode | Avoids TLS setup complexity for local dev. Never use in production. |
| Realm JSON import | Reproducible environments — no manual UI clicks after `reset-keycloak`. |
| `AUTH_URL` uses `localhost`, `TOKEN_URL` uses container name | Browser cannot resolve Docker internal hostnames; server-to-server calls can. |
| API stays on Firebase auth | Out of scope. Firebase → Keycloak migration is a separate initiative requiring NestJS strategy replacement (`passport-custom` → `passport-keycloak-bearer` or `passport-jwt` with Keycloak JWKS). |
| Grafana admin password kept | Emergency fallback in case OIDC is misconfigured during development. |
| Client secrets in `.env.public` | Dev-only convenience. Must be rotated and injected as secrets in CI/production. |

---

## Phase 8 — Production Secrets Management

### The problem with the dev realm JSON in production

The dev realm JSON commits two things that must never reach production:

1. **Hardcoded client secrets** (`"secret": "grafana-client-secret"`) — predictable, committed to git
2. **Seeded test users with plaintext passwords** — must not exist in production

The production approach separates these concerns into three independent mechanisms.

### 8.1 — Remove hardcoded secrets from the realm JSON (use env interpolation)

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

### 8.2 — Secret injection at deploy time

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

### 8.3 — Never commit the production realm JSON

The dev realm JSON (`conference-manager-realm.json`) is committed to git. It contains test users and hardcoded secrets — both acceptable for development only. For production:

```
tools/keycloak/realms/
  conference-manager-realm.json          ← dev: committed, test users, hardcoded secrets
  conference-manager-realm.prod.json     ← prod template: NO users, secrets are ${env.*}
```

Add `*.prod.json` to `.gitignore` if you want to prevent accidental commits of a populated prod file. Alternatively, keep both files in git since the prod template only contains `${env.*}` placeholders — no real secrets.

---

## Phase 9 — Production User and Role Management

### 9.1 — No users in production realm JSON

The dev realm JSON seeds `dev-admin` and `dev-viewer` for convenience. Production realm exports must have an empty `"users": []` array. Users are never seeded via JSON in production.

### 9.2 — User provisioning options (choose one per environment)

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

### 9.3 — Role management best practices

| Practice | Rationale |
|----------|-----------|
| Roles are defined in the realm JSON and committed to git | Roles are structural config, not secrets. IaC applies them. |
| Users are never in the realm JSON (production) | Users are runtime data, not code. |
| Use Keycloak Groups to bundle roles | Assign a user to a Group (`ops-team`) rather than individual roles. The Group carries the role assignments. Role changes affect all group members automatically. |
| One realm per environment, not per service | `conference-manager-tools-dev`, `conference-manager-tools-staging`, `conference-manager-tools-prod`. Keeps clients isolated — a misconfigured dev client cannot affect prod. |
| Keycloak's own admin console is protected by its own realm (`master`) | Use a dedicated admin service account, not the bootstrap admin credentials, for automation. Rotate bootstrap credentials after first deploy. |
| Enable Keycloak event logging | Admin console → Events → Config → Enable `LOGIN`, `LOGIN_ERROR`, `ADMIN` event types. Ship logs to the same observability stack (Prometheus / Grafana). |

### 9.4 — Keycloak realm as Infrastructure as Code (Terraform)

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

---

## Future: Migrate NestJS API Auth from Firebase to Keycloak

If the team decides to also migrate the API's auth to Keycloak (replacing Firebase), the following additional steps apply — **not in current scope**:

1. Add a `ms-conference-api` OIDC client to the Keycloak realm
2. Replace `FirebaseAuthStrategy` with a `JwtStrategy` using Keycloak's JWKS endpoint:  
   `http://ms-conference-keycloak:8080/realms/conference-manager/protocol/openid-connect/certs`
3. Remove `firebase-admin` SDK dependency
4. Remove Firebase env vars (`FIREBASE_*`, `GOOGLE_APPLICATION_CREDENTIALS`)
5. Update `UserEntity.uid` to store `sub` claim from Keycloak JWT instead of Firebase UID
6. Update `AuthService.register()` to call Keycloak Admin REST API instead of Firebase Admin SDK
7. Add an `auth.keycloak.enabled` Unleash feature toggle (mirroring the existing `auth.firebase.enabled`)
