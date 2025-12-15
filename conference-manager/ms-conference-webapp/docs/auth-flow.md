# Authentication & Redirect Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser (Client)
    participant MW as Next.js Middleware
    participant R as App Route (Server)
    participant API as Route Handlers (/api/session, /api/login)
    participant Ctx as UserContext (Client)

    U->>B: Request protected route (e.g., /conferences)
    B->>MW: Forward request
    alt Cookie cm_user missing
        MW-->>B: Redirect to /
    else Cookie cm_user present
        MW-->>R: Allow request
        R-->>B: Render page
        B-->>Ctx: Mount client components
        Ctx->>API: GET /api/session
        API-->>Ctx: { user | null }
        alt user
            Ctx-->>B: isLoggedIn = true
        else null
            Ctx-->>B: isLoggedIn = false
        end
    end

    U->>B: Submit login form
    B->>API: POST /api/login { user, credentials, token }
    API-->>B: Set HttpOnly cookie cm_user
    B->>B: Redirect to /
    B->>Ctx: Mount + hydrate via GET /api/session
    Ctx-->>B: isLoggedIn = true
```

- Middleware: [middleware.ts](../middleware.ts) enforces redirect to `/` when `cm_user` is absent on non-public routes.
- Session endpoint: [src/app/api/session/route.ts](../src/app/api/session/route.ts) returns the user based on the HttpOnly cookie.
- Login endpoint: [src/app/api/login/route.ts](../src/app/api/login/route.ts) sets/clears the `cm_user` cookie.
- Client context: [src/app/lib/contexts/UserContext.tsx](../src/app/lib/contexts/UserContext.tsx) hydrates from `/api/session` and exposes `login/logout`.
- Shared API: [src/app/shared/api/index.ts](../src/app/shared/api/index.ts) provides `Authentication.verifyAuth/login/logout` helpers.
