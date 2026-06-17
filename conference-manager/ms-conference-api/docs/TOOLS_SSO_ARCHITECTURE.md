# SSO — Architecture & Auth Flows

Keycloak acts as the single Identity Provider (IdP) for the observability and feature-flag tooling tier. The NestJS API continues to use Firebase as its own IdP (separate concern, separate auth boundary).

---

## Container Architecture

```mermaid
graph TB
    Browser(["👤 Developer Browser"])

    subgraph Host["Host Machine (localhost)"]
        direction TB
        P3000(":3000")
        P4242(":4242")
        P8080(":8080")
        P9090(":9090")
    end

    subgraph Docker["Docker Network — ms-conference-network"]
        direction TB

        subgraph SSO["Identity Provider"]
            Keycloak["🔑 Keycloak :8080\nRealm: conference-manager-tools\nClients: grafana · unleash"]
        end

        subgraph Observability["Observability"]
            Grafana["📊 Grafana :3000\nGeneric OAuth (native)\nRole mapping via JWT claims"]
            Prometheus["📈 Prometheus :9090\nNo auth — internal only"]
        end

        subgraph FeatureFlags["Feature Flags"]
            Proxy["🔀 oauth2-proxy :4243\nOIDC gateway for Unleash\nskip-oidc-discovery=true"]
            Unleash["🚩 Unleash :4242\nAUTH_TYPE=none\nInternal only — no host port"]
            UnleashDB[("🐘 PostgreSQL :5432")]
        end

        subgraph Application
            API["ms-conference-api :5002\nNESTJS API"]
        end
    end

    %% Host port bindings
    Browser -->|"OIDC login UI"| P8080
    Browser -->|"dashboards"| P3000
    Browser -->|"feature flags UI"| P4242

    P8080 --> Keycloak
    P3000 --> Grafana
    P4242 --> Proxy
    P9090 --> Prometheus

    %% SSO flows (server-to-server, internal)
    Grafana -- "token exchange\n& userinfo (internal)" --> Keycloak
    Proxy -- "token exchange\n& JWKS (internal)" --> Keycloak
    Proxy -- "proxy after auth" --> Unleash

    %% Internal connections
    API -.->|"JWT validation"| Firebase
    Unleash --> UnleashDB
    Prometheus -- "scrape /metrics" --> API

    %% Styling
    classDef sso fill:#4a4a8a,color:#fff,stroke:#6a6ab8
    classDef proxy fill:#2d6a4f,color:#fff,stroke:#52b788
    classDef db fill:#6c3d14,color:#fff,stroke:#c77e3a
    classDef port fill:#f8f9fa,color:#212529,stroke:#ced4da
    classDef browser fill:#1971c2,color:#fff,stroke:#1864ab

    class Keycloak sso
    class Proxy,Unleash proxy
    class Grafana,Prometheus app
    class MongoDB,UnleashDB db
    class P3000,P4242,P8080,P9090 port
    class Browser browser
```

---

## Auth Flow 1 — Grafana via Native Generic OAuth

Grafana ships with built-in Generic OAuth / OIDC support. No proxy is needed — Grafana handles the Authorization Code flow internally.

**URL split:** The browser redirect uses `localhost:8080` (host-accessible). The server-side token exchange uses the Docker container name `ms-conference-keycloak:8080` (internal only). This is configured via separate `GF_AUTH_GENERIC_OAUTH_AUTH_URL` vs `GF_AUTH_GENERIC_OAUTH_TOKEN_URL` env vars.

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Browser
    participant Grafana as Grafana :3000
    participant Keycloak as Keycloak :8080<br/>(localhost — browser)<br/>(ms-conference-keycloak — internal)

    Dev->>Browser: navigate to localhost:3000

    Browser->>Grafana: GET /
    Grafana-->>Browser: 302 → /login

    Browser->>Grafana: GET /login
    Grafana-->>Browser: login page with "Sign in with Keycloak SSO" button

    Dev->>Browser: click "Sign in with Keycloak SSO"
    Browser->>Grafana: GET /login/generic_oauth

    Note over Grafana: Builds auth URL using<br/>GF_AUTH_GENERIC_OAUTH_AUTH_URL<br/>(localhost:8080 — browser-facing)

    Grafana-->>Browser: 302 → http://localhost:8080/realms/conference-manager-tools/protocol/openid-connect/auth?client_id=grafana&response_type=code&scope=openid+email+profile+roles&redirect_uri=http://localhost:3000/login/generic_oauth

    Browser->>Keycloak: GET /auth?client_id=grafana&...
    Keycloak-->>Browser: login page (conference-manager-tools realm)

    Dev->>Browser: enter credentials (e.g. dev-admin / admin1234)
    Browser->>Keycloak: POST credentials

    Keycloak->>Keycloak: validate credentials<br/>attach realm roles to session
    Keycloak-->>Browser: 302 → http://localhost:3000/login/generic_oauth?code=AUTH_CODE

    Browser->>Grafana: GET /login/generic_oauth?code=AUTH_CODE

    Note over Grafana,Keycloak: Server-to-server (internal Docker network)<br/>GF_AUTH_GENERIC_OAUTH_TOKEN_URL<br/>= http://ms-conference-keycloak:8080/...

    Grafana->>Keycloak: POST /token (code=AUTH_CODE, client_secret=grafana-client-secret)
    Keycloak-->>Grafana: access_token + id_token (JWT)

    Grafana->>Keycloak: GET /userinfo (Authorization: Bearer access_token)
    Keycloak-->>Grafana: { email, name, roles: ["grafana-admin"] }

    Note over Grafana: Role mapping via<br/>GF_AUTH_GENERIC_OAUTH_ROLE_ATTRIBUTE_PATH:<br/>grafana-admin → Admin<br/>grafana-editor → Editor<br/>else → Viewer

    Grafana->>Grafana: create/update user session<br/>assign Grafana role from claim
    Grafana-->>Browser: 302 → / (session cookie set)

    Browser->>Grafana: GET / (with session cookie)
    Grafana-->>Browser: 200 Dashboard (role: Admin)
```

---

## Auth Flow 2 — Unleash via oauth2-proxy

Unleash OSS v8 has no native OIDC support (Enterprise feature). oauth2-proxy acts as an SSO gateway: it handles the full Keycloak OIDC flow, then forwards authenticated requests to Unleash. Unleash runs with `AUTH_TYPE=none` — the proxy is the sole authentication gate.

**URL split:** Same principle as Grafana. `--login-url` uses `localhost:8080` (browser redirect). `--redeem-url`, `--validate-url`, and `--oidc-jwks-url` use `ms-conference-keycloak:8080` (server-to-server, internal). `--skip-oidc-discovery=true` enables this split; otherwise all endpoints would be derived from the discovery document and use a single hostname.

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Browser
    participant Proxy as oauth2-proxy :4242<br/>(host) / :4243 (internal)
    participant Keycloak as Keycloak :8080<br/>(localhost — browser)<br/>(ms-conference-keycloak — internal)
    participant Unleash as Unleash :4242<br/>(internal only)<br/>AUTH_TYPE=none

    Dev->>Browser: navigate to localhost:4242

    Browser->>Proxy: GET /
    Proxy->>Proxy: no session cookie found

    Note over Proxy,Keycloak: --login-url = http://localhost:8080/...<br/>(browser-accessible external URL)

    Proxy-->>Browser: 302 → http://localhost:8080/realms/conference-manager-tools/protocol/openid-connect/auth?client_id=unleash&redirect_uri=http://localhost:4242/oauth2/callback&response_type=code

    Browser->>Keycloak: GET /auth?client_id=unleash&...
    Keycloak-->>Browser: login page (conference-manager-tools realm)

    Dev->>Browser: enter credentials (e.g. dev-admin / admin1234)
    Browser->>Keycloak: POST credentials

    Keycloak->>Keycloak: validate credentials<br/>attach realm roles to session
    Keycloak-->>Browser: 302 → http://localhost:4242/oauth2/callback?code=AUTH_CODE

    Browser->>Proxy: GET /oauth2/callback?code=AUTH_CODE

    Note over Proxy,Keycloak: Server-to-server (internal Docker network)<br/>--redeem-url = http://ms-conference-keycloak:8080/...

    Proxy->>Keycloak: POST /token (code=AUTH_CODE, client_secret=unleash-client-secret)
    Keycloak-->>Proxy: access_token + id_token (JWT)

    Proxy->>Keycloak: GET /userinfo (validate token)
    Keycloak-->>Proxy: { email, sub, roles: ["unleash-admin"] }

    Note over Proxy,Keycloak: JWKS validation (internal)<br/>--oidc-jwks-url = http://ms-conference-keycloak:8080/.../certs<br/>--insecure-oidc-skip-issuer-verification=true<br/>(iss mismatch: localhost vs container name)

    Proxy->>Proxy: set encrypted session cookie (_oauth2_proxy)<br/>signed with OAUTH2_PROXY_COOKIE_SECRET

    Proxy-->>Browser: 302 → / (session cookie set)

    Browser->>Proxy: GET / (with _oauth2_proxy cookie)
    Proxy->>Proxy: validate session cookie

    Note over Proxy,Unleash: Authenticated — forward request<br/>Unleash accepts all requests (AUTH_TYPE=none)

    Proxy->>Unleash: GET / (proxied, internal: unleash-app:4242)
    Unleash-->>Proxy: 200 Unleash UI
    Proxy-->>Browser: 200 Unleash UI (no login prompt)
```

---

## Internal Unleash Access (NestJS API — no proxy)

The NestJS API reads feature flags directly from Unleash using the internal Docker network, bypassing oauth2-proxy entirely. This path is never exposed externally.

```mermaid
graph LR
    API["⚙️ NestJS API\nunleash-app:4242/api"]
    Unleash["🚩 Unleash\nAUTH_TYPE=none"]

    API -->|"HTTP — internal Docker network\n(no SSO, no API key required)"| Unleash
```

---

## Port Reference

| Port | Exposed to host | Service | Auth gate |
|------|----------------|---------|-----------|
| `3000` | Yes | Grafana | Keycloak SSO (native Generic OAuth) |
| `4242` | Yes | oauth2-proxy | Keycloak SSO (OIDC proxy) → Unleash |
| `4242` (internal) | No | Unleash | None (`AUTH_TYPE=none`) |
| `8080` | Yes | Keycloak | Keycloak admin credentials (`master` realm) |
| `5002` | Yes | API (NESTJS API) | Firebase JWT |
| `9090` | Yes | Prometheus | None (dev — restrict in production) |

## Key Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| `KEYCLOAK_ADMIN_USERNAME` / `KEYCLOAK_ADMIN_PASSWORD` | Keycloak | Bootstrap admin for `master` realm |
| `KEYCLOAK_GRAFANA_CLIENT_SECRET` | Grafana | OIDC client secret — must match realm JSON |
| `KEYCLOAK_UNLEASH_CLIENT_SECRET` | oauth2-proxy | OIDC client secret — must match realm JSON |
| `OAUTH2_PROXY_COOKIE_SECRET` | oauth2-proxy | Encrypts the `_oauth2_proxy` session cookie (24-byte base64url) |
| `GRAFANA_ADMIN_PASSWORD` | Grafana | Local fallback admin — kept as emergency access if SSO breaks |

## Dev Test Users

Provisioned via `tools/keycloak/realms/conference-manager-tools-realm.json` on every `reset-keycloak`.

| Username | Password | Grafana role | Unleash access |
|----------|----------|-------------|----------------|
| `dev-admin` | `admin1234` | Admin | Full (unleash-admin role) |
| `dev-editor` | `editor1234` | Editor | — |
| `dev-viewer` | `viewer1234` | Viewer | Read-only (unleash-viewer role) |
