# Migration Plan — Express Legacy to NestJS

## 1. Current Architecture Overview

The API runs two stacks in the same process:

```
main.ts
├── application.ts     → Express app  (v1 routes, manual DI, JS files)
│     └── /v1/...     → 11 route groups served by Express
└── AppModule          → NestJS app   (v2 routes, IoC, TypeScript)
      └── /v2/...     → 5 modules fully migrated
```

`NestFactory.create(AppModule, new ExpressAdapter(expressApp))` mounts NestJS on top of the existing Express instance. Both stacks run concurrently on the same port. The goal is to eliminate the Express layer entirely and run pure NestJS.

---

## 2. Legacy Express Inventory

### 2.1 Route Map (`/v1`)

| Route group | File | Methods | Middleware chain | Migration status |
|---|---|---|---|---|
| `/v1/healthcheck` | `healthcheck.controller.js` | `GET /` | none | ✅ migrated → `/v2/health` |
| `/v1/events` | `events.controller.js` + `event.controller.js` | `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id/delete`, `PUT /:id/images`, `PUT /:id/open`, `PUT /:id/pause`, `PUT /:id/close`, `PUT /:id/attendees`, `DELETE /:id/:idImage` | auth-user-token, auth-user-admin, create-event, update-event, event-id, check-token-list-events | ⚠️ partial — v2 exists but missing: delete, image endpoints, status transitions |
| `/v1/headquarters` | `headquarters.controller.js` | `GET /`, `GET /:id` | none | ✅ migrated → `/v2/headquarters` (+ write ops added) |
| `/v1/users` | `users.controller.js` + `user.controller.js` | `GET /`, `GET /:uid` | requestvalidation | ✅ migrated → `/v2/users` (+ write ops added) |
| `/v1/authenticate` | `authentication.controller.js` | `POST /` (create), `POST /revoke-token`, `POST /reset-password` | none | ❌ not migrated |
| `/v1/roles` | `roles.controller.js` + `role.controller.js` | `GET /`, `GET /:id` | none | ❌ not migrated |
| `/v1/attendees` | `attendees.controller.js` + `attendee.controller.js` | `GET /:id` (CSV export), `POST /`, `PUT /`, `DELETE /` | none | ❌ not migrated (stubs) |
| `/v1/image` | `image.controller.js` | `POST /` (upload), `DELETE /:id` (erase) | none | ❌ not migrated |
| `/v1/accounts` | `accounts.controller.js` | `GET /balance`, `GET /` | session | ❌ not migrated (session-based legacy) |
| `/v1/token` | `token.controller.js` | `GET /`, `POST /` (OAuth grant types) | none | ❌ not migrated (OAuth-like legacy) |
| `/v1/profile` | `profile.controller.js` | `GET /` | session | ❌ not migrated (session-based legacy) |
| `/v1/open-api` | `open-api.controller.js` | `GET /` | none | ❌ not migrated (dev-only, replaced by Swagger) |

### 2.2 Legacy Services (all JS, manual DI via `service.container.js`)

| Service | File | Backing store | Used by |
|---|---|---|---|
| `events` | `events.service.js` | MongoDB direct + Firebase Firestore (dual-DB) | events, attendees |
| `authentication` | `authentication.service.js` | Firebase Admin Auth | authenticate, accounts, profile |
| `headquarters` | `headquarters.service.js` | MongoDB direct | headquarters |
| `roles` | `roles.service.js` | MongoDB direct | roles |
| `users` | `user.service.js` | MongoDB direct | users, profile |
| `accounts` | `accounts.service.js` | session-based | accounts |
| `session` | `session.service.js` | Firebase Auth session | accounts, profile, authenticate |
| `storage` | `storage.service.js` | Firebase Storage | image |
| `authCode` | `auth.codes.service.js` | MongoDB (auth codes) | token |
| `attendees` | `attendees.service.js` | MongoDB direct | attendees |

### 2.3 Legacy Middlewares

| File | Responsibility | NestJS equivalent |
|---|---|---|
| `auth-user-token.js` | Firebase token verification + Unleash gate | `AuthGuard('jwt')` already in use |
| `auth-user-admin.js` | DB lookup to assert `isAdmin` flag | `RolesGuard` + `@Roles(ADMIN_ROLE)` |
| `feature-flags.js` | Unleash client wrapper | `unleash.provider.ts` |
| `create-event.js` | Request body validation for create | `ValidationPipe` + `CreateEventDto` |
| `update-event.js` | Request body validation for update | `ValidationPipe` + `UpdateEventDto` |
| `event-id.js` | Extracts and validates event ID | `@Param` + `EventIdDto` |
| `check-token-list-events.js` | Optional auth on GET /events | `TokenInterceptor` |
| `request.validation.ts` | Global auth gate for non-public paths | `AuthGuard('jwt')` per route |

### 2.4 Legacy Models (to be removed)

| File | Replaces with |
|---|---|
| `src/models/event.js` | `event.entity.ts` (already exists) |
| `src/models/user.js` | `user.entity.ts` (already exists) |
| `src/models/user-authentication.js` | Firebase Admin SDK types directly |

### 2.5 Dead Code / Infrastructure to Remove

| Path | Reason |
|---|---|
| `src/application.ts` | Express app factory — eliminated when adapter removed |
| `src/controllers/v1/` | Entire directory — all routes migrated by end of plan |
| `src/services/` | Entire directory — replaced by NestJS services |
| `src/middlewares/` | All files — replaced by NestJS guards / pipes / interceptors |
| `src/models/` | Legacy Mongoose models — entities already exist |
| `src/providers/` | Manual DI providers — replaced by NestJS IoC |
| `src/validations/` | Joi schema validators — replaced by `class-validator` DTOs |
| `src/helpers/utils.js` | `eventStatus`, `isObjectEmpty` — inline into services or NestJS utilities |
| `src/services-config/app.json` | Legacy service config — environment.js or `@nestjs/config` |
| `src/templates/api.yml` | Legacy OpenAPI spec — replaced by NestJS Swagger auto-generation |
| `src/infrastructure/request.validation.ts` | Global Express middleware — eliminated |
| `src/application/use-cases/user/get-users.usecase.ts` | Stub use-case — already replaced by `UserService` |
| `src/domain/user.entity.ts` | Duplicate domain entity — `modules/users/user.entity.ts` is canonical |

---

## 3. What Is Already Migrated (NestJS v2)

| Module | Endpoints | Notes |
|---|---|---|
| `ConferenceModule` | `POST /v2/conferences`, `GET /v2/conferences`, `GET /v2/conferences/:id`, `PUT /v2/conferences/:id`, `DELETE /v2/conferences/:id`, `POST /v2/conferences/:id/attendee/:userId`, `PUT /v2/conferences/:id/status`, `POST /v2/conferences/:id/images`, `DELETE /v2/conferences/:id/images/:imageId`, `GET /v2/conferences/:id/attendees/export` | Complete |
| `HeadquarterModule` | `GET /v2/headquarters`, `GET /v2/headquarters/:id`, `POST /v2/headquarters`, `PUT /v2/headquarters/:id`, `DELETE /v2/headquarters/:id` | Complete |
| `UserModule` | `GET /v2/users`, `GET /v2/users/:uid`, `POST /v2/users`, `PUT /v2/users/:uid`, `DELETE /v2/users/:uid` | Complete |
| `AuthModule` | `POST /v2/auth/register`, `POST /v2/auth/revoke-token`, `POST /v2/auth/reset-password` | Complete |
| `RoleModule` | `GET /v2/roles`, `GET /v2/roles/:id` | Complete |
| `ProfileModule` | `GET /v2/profile` | Complete |
| `HealthController` | `GET /v2/health` | Complete |
| `FirebaseModule` + `FirebaseAuthStrategy` | JWT auth via Firebase | Complete |
| `UnleashProvider` | Feature flags | Complete |

---

## 4. Migration Phases

### Phase 1 — AuthModule (Firebase authentication flows) ✅ COMPLETED
**Scope**: Migrate `/v1/authenticate` to `/v2/auth`.

**Endpoints:**

| Legacy | NestJS target | Auth | Notes |
|---|---|---|---|
| `POST /v1/authenticate` (createUser) | `POST /v2/auth/register` | `admin` | Create Firebase auth user + DB user record |
| `POST /v1/authenticate/revoke-token` | `POST /v2/auth/revoke-token` | `jwt` | Revoke Firebase refresh tokens |
| `POST /v1/authenticate/reset-password` | `POST /v2/auth/reset-password` | public | Send Firebase password reset email |

**Files to create:**
- `src/modules/auth/auth.entity.ts` — if needed (likely reuses `User` entity)
- `src/modules/auth/dto/register.dto.ts` — email, password, firstName, lastName
- `src/modules/auth/dto/revoke-token.dto.ts`
- `src/modules/auth/dto/reset-password.dto.ts` — email
- `src/modules/auth/auth.service.ts` — wraps `FirebaseAdminService` (already exists)
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.module.ts` — imports `FirebaseModule`, `UserModule`
- `src/infrastructure/swagger/v2/register.decorator.ts`
- `src/infrastructure/swagger/v2/revoke-token.decorator.ts`
- `src/infrastructure/swagger/v2/reset-password.decorator.ts`
- `src/modules/auth/auth.service.spec.ts`
- `src/modules/auth/auth.controller.spec.ts`
- Update `src/app.module.ts` — import `AuthModule`

**Key behaviour change**: `create` in legacy creates only the Firebase Auth user. In v2, `POST /v2/auth/register` will create both the Firebase Auth user AND the MongoDB user record (calling `UserService.create()`) in a single operation.

**Validation:** `make lint && make unit-tests-v2`

---

### Phase 2 — RolesModule ✅ COMPLETED
**Scope**: Migrate `/v1/roles` to `/v2/roles`.

**Endpoints:**

| Legacy | NestJS target | Auth |
|---|---|---|
| `GET /v1/roles` | `GET /v2/roles` | `admin` |
| `GET /v1/roles/:id` | `GET /v2/roles/:id` | `admin` |

**Files to create:**
- `src/modules/roles/role.entity.ts` — `{ name: string }` + `@Schema({ timestamps: true })`
- `src/modules/roles/interfaces/role-response.ts`
- `src/modules/roles/dto/role-id.dto.ts`
- `src/modules/roles/role.mapper.ts`
- `src/modules/roles/role.service.ts` — `getAll()`, `getById(id)`
- `src/modules/roles/role.controller.ts`
- `src/modules/roles/role.module.ts`
- `src/infrastructure/swagger/v2/list-roles.decorator.ts`
- `src/infrastructure/swagger/v2/get-role-by-id.decorator.ts`
- `src/helpers/mocks/roles/role-detail.ts`
- `src/modules/roles/role.service.spec.ts`
- `src/modules/roles/role.controller.spec.ts`
- Update `src/app.module.ts` — import `RoleModule`

**Validation:** `make lint && make unit-tests-v2`

---

### Phase 3 — ProfileModule ✅ COMPLETED
**Scope**: Migrate `GET /v1/profile` to `GET /v2/profile`.

The legacy profile endpoint resolves a Firebase session token to a MongoDB user record and returns it. In v2, this is already partially possible via `GET /v2/users/:uid` once the caller knows their own uid. The v2 profile endpoint provides a self-service GET that reads the authenticated user's uid from the JWT claim.

**Endpoints:**

| Legacy | NestJS target | Auth |
|---|---|---|
| `GET /v1/profile` | `GET /v2/profile` | `jwt` (any authenticated user) |

**Files to create:**
- `src/modules/profile/profile.controller.ts` — reads `req.user.userId` from JWT, calls `UserService.getByUid()`
- `src/modules/profile/profile.module.ts` — imports `UserModule`
- `src/infrastructure/swagger/v2/get-profile.decorator.ts`
- `src/modules/profile/profile.controller.spec.ts`
- Update `src/app.module.ts` — import `ProfileModule`

**Note**: No new service needed — delegates entirely to `UserService`.

**Validation:** `make lint && make unit-tests-v2`

---

### Phase 4 — Decommission Express Layer ✅ COMPLETED
**Scope**: Remove the dual-stack setup. This is the breaking-change phase — coordinate with consumers of the v1 API before executing.

**Pre-condition**: All v1 routes from Phases 1–4 have v2 equivalents. Routes not migrated (accounts, token) are confirmed as intentionally retired.

**Steps:**

1. **Update `main.ts`** — remove `ExpressAdapter`, `getApplication()`, replace with:
   ```typescript
   const app = await NestFactory.create(AppModule)
   ```

2. **Delete legacy directories:**
   - `src/application.ts`
   - `src/controllers/v1/`
   - `src/services/`
   - `src/middlewares/` (all files)
   - `src/models/`
   - `src/providers/`
   - `src/validations/`
   - `src/templates/api.yml`
   - `src/services-config/`

3. **Delete dead NestJS stubs:**
   - `src/application/use-cases/user/get-users.usecase.ts`
   - `src/domain/user.entity.ts`
   - `src/infrastructure/request.validation.ts`
   - `src/interfaces/auth/firebase.guard.ts` (replaced by `AuthGuard('jwt')`)

4. **Clean up `src/helpers/utils.js`** — remove `eventStatus` (move to `ConferenceStatus`/`EventStatus` enums) and `isObjectEmpty` (inline use-sites); delete file.

5. **Update `src/infrastructure/headers.ts`** — keep (used for CORS config).

6. **Update `package.json`** — remove dependencies that were only used by the legacy layer:
   - `json2csv` (CSV export now handled inline or via a NestJS helper)
   - Any Express-specific packages no longer needed (`express` remains as peer for `@nestjs/platform-express`)

7. **Run full test suite:**
   ```
   make lint && make unit-tests
   ```

---

### Phase 5 — Routes Retired (not migrated) ✅ COMPLETED

The following legacy routes are intentionally not migrated to v2. They can be removed in Phase 5 without replacement:

| Route | Reason for retirement |
|---|---|
| `GET /v1/accounts/balance`, `GET /v1/accounts` | Session-based billing feature; no active consumer identified |
| `GET /v1/token`, `POST /v1/token` | OAuth code-exchange flow; superseded by Firebase Auth SDK on the client |
| `GET /v1/open-api` | Dev-only static docs; replaced by NestJS Swagger at `/docs` |
| `POST /v1/attendees`, `PUT /v1/attendees`, `DELETE /v1/attendees` | Confirmed stubs that were never implemented |

**Action required before Phase 5**: confirm with stakeholders that these are retired.

---

## 5. Architectural Changes Summary

| Concern | Legacy (Express v1) | NestJS (v2) |
|---|---|---|
| Dependency injection | Manual `service.container.js` | NestJS IoC (`@Injectable`, `@Module`) |
| Request validation | Joi schemas in `src/validations/` | `class-validator` + `ValidationPipe` |
| Auth token verification | `auth-user-token.js` middleware | `AuthGuard('jwt')` + `FirebaseAuthStrategy` |
| Admin authorization | `auth-user-admin.js` + DB lookup | `RolesGuard` + `@Roles(ADMIN_ROLE)` |
| Feature flags | `feature-flags.js` (Unleash) | `unleash.provider.ts` |
| Error responses | `BaseService.getErrorResponse()` envelope | NestJS `HttpException` classes |
| Response envelope | `{ data, message, responseCode }` | Plain typed response body |
| Database access | MongoDB native driver (`mongodb`) | Mongoose via `@nestjs/mongoose` |
| API documentation | Static `api.yml` template | Auto-generated Swagger via `@nestjs/swagger` |
| Dual-database | MongoDB + Firebase Firestore (events) | MongoDB only (Mongoose) |
| Bootstrap | `NestFactory` + `ExpressAdapter(expressApp)` | `NestFactory.create(AppModule)` (pure NestJS) |

---

## 6. File Deletion Checklist (Phase 5)

```
src/application.ts
src/controllers/v1/
src/services/
src/middlewares/
src/models/
src/providers/
src/validations/
src/templates/
src/services-config/
src/helpers/utils.js
src/domain/user.entity.ts
src/infrastructure/request.validation.ts
src/interfaces/auth/firebase.guard.ts
src/application/use-cases/user/get-users.usecase.ts
```

---

## 7. Implementation Order and Makefile Validation

```
Phase 1: AuthModule ✅ COMPLETED
  → make lint && make unit-tests-v2

Phase 2: RolesModule ✅ COMPLETED
  → make lint && make unit-tests-v2

Phase 3: ProfileModule ✅ COMPLETED
  → make lint && make unit-tests-v2

Phase 4: Decommission Express layer ✅ COMPLETED
  → make lint && make unit-tests        ← Jest (v2) only — AVA removed with v1 layer
  → verify no imports remain from deleted paths (grep -r 'controllers/v1' src/)
  → verify no imports remain from deleted paths (grep -r 'services/' src/)
  → smoke test: make launch-local-dev && make seed-data API_TOKEN=<token>
```

---

## 8. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| v1 consumers calling retired routes (accounts, token) | Breaking | Audit client apps before Phase 5; add HTTP 410 stubs if needed |
| Dual-DB migration (Firestore → MongoDB) for events | Data loss | Events service in legacy already queries MongoDB; Firestore path is dead code |
| `json2csv` dependency for CSV attendee export | Build failure after removal | Implement inline CSV serialization in `EventService.exportAttendeesAsCsv()` in Phase 1 |
| Firebase Admin SDK in `AuthService` | Auth regression | Reuse existing `FirebaseAdminService` — no new Firebase setup needed |
| `ExpressAdapter` removal breaking existing routes | API downtime | Keep adapter until Phase 5; validate all v2 routes before removing |
