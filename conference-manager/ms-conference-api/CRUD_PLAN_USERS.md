# CRUD Plan — Users API (`/v2/users`)

## 1. Current State Analysis

### Architecture
The user domain is split across two locations:
- **Domain layer**: `src/modules/users/` — entity, service, DTOs, interfaces
- **Presentation layer**: `src/interfaces/user/` — controller and e2e spec

Neither layer has been wired into a NestJS module — `UserModule` is referenced but does not exist.

### Existing Files

| File | Status |
|---|---|
| `src/modules/users/user.entity.ts` | Missing `_id!: string`, `@ApiProperty`, `isSuperAdmin` field |
| `src/modules/users/interfaces/user-response.ts` | `_id: Types.ObjectId` (should be `string`); missing `isSuperAdmin` |
| `src/modules/users/dto/add-user-request.dto.ts` | Missing `class-validator` decorators |
| `src/modules/users/dto/user-request.dto.ts` | Missing `class-validator` decorators |
| `src/modules/users/user.service.ts` | Only `getByUserId` + `addUser`; throws generic `Error` instead of `NotFoundException`; uses `new Model()` + `.save()` anti-pattern |
| `src/interfaces/user/user.controller.ts` | Mostly commented-out; uses `FirebaseAuthGuard` (inconsistent with project auth standard) |
| `src/interfaces/user/user.controller.spec.ts` | E2E test; works but tests `FirebaseAuthGuard`; will be updated |
| `src/modules/users/user.service.spec.ts` | `describe.skip` + `MongoMemoryServer` (Alpine-incompatible) |
| `src/application/use-cases/user/get-users.usecase.ts` | Stub returning `[]`; will be removed and replaced by direct service injection |

---

## 2. Identified Defects (7)

1. **No `UserModule`** — `app.module.ts` references `./modules/users/user.module` which does not exist
2. **Entity missing fields** — no `_id!: string`, no `@ApiProperty`, no `isSuperAdmin`
3. **Response interface broken** — `_id: Types.ObjectId` causes mapper type errors; missing `isSuperAdmin`
4. **Service incomplete** — no `getAll`, `update`, `delete` methods; wrong exception on `getByUserId`; anti-pattern constructor
5. **DTOs missing validators** — `add-user-request.dto.ts` and `user-request.dto.ts` have no `class-validator` decorators
6. **Controller non-functional** — CRUD endpoints commented out; wrong auth guard (`FirebaseAuthGuard`)
7. **Service spec skipped + Alpine-incompatible** — `describe.skip` + `MongoMemoryServer` cannot run in container

---

## 3. Target Endpoints (5)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v2/users` | `admin` | Create a user |
| `GET` | `/v2/users` | `admin` | List all users |
| `GET` | `/v2/users/:uid` | `admin` | Get user by Firebase uid |
| `PUT` | `/v2/users/:uid` | `admin` | Update user |
| `DELETE` | `/v2/users/:uid` | `admin` | Hard delete user |

All endpoints require `AuthGuard('jwt')` + `RolesGuard` + `@Roles(ADMIN_ROLE)`.

---

## 4. Business Rules

1. `uid` (Firebase auth uid) must be unique — reject with `BadRequestException` on duplicate create
2. `email` must be unique — reject with `BadRequestException` on duplicate create
3. `isAdmin` defaults to `false` on creation; can be changed via update
4. `isSuperAdmin` is always `false` on create; cannot be changed via the API (read-only flag)
5. Delete is a **hard delete** — document is permanently removed from the collection

---

## 5. New Files to Create (10)

| Path | Purpose |
|---|---|
| `src/modules/users/user.module.ts` | NestJS module wiring entity, service, controller |
| `src/modules/users/user.mapper.ts` | Static mapper: `toResponse`, `toResponseList`, `createUserMapper`, `updateUserMapper` |
| `src/modules/users/dto/create-user.dto.ts` | Replaces `add-user-request.dto.ts` — add class-validator, `userId` hidden field |
| `src/modules/users/dto/update-user.dto.ts` | `PartialType(CreateUserDto)` |
| `src/modules/users/dto/user-uid.dto.ts` | Path param DTO for `:uid` |
| `src/infrastructure/swagger/v2/create-user.decorator.ts` | Swagger for `POST /v2/users` |
| `src/infrastructure/swagger/v2/list-users.decorator.ts` | Swagger for `GET /v2/users` |
| `src/infrastructure/swagger/v2/get-user-by-uid.decorator.ts` | Swagger for `GET /v2/users/:uid` |
| `src/infrastructure/swagger/v2/update-user.decorator.ts` | Swagger for `PUT /v2/users/:uid` |
| `src/infrastructure/swagger/v2/delete-user.decorator.ts` | Swagger for `DELETE /v2/users/:uid` |
| `src/helpers/mocks/users/user-detail.ts` | Test stubs: `USER_MOCK`, `LIST_USERS_MOCK`, `CREATE_USER_MOCK_DTO`, `UPDATE_USER_MOCK_DTO` |

---

## 6. Files to Update (7)

| Path | Change |
|---|---|
| `src/modules/users/user.entity.ts` | Add `_id!: string`, `@ApiProperty`, `isSuperAdmin` field |
| `src/modules/users/interfaces/user-response.ts` | Fix `_id: string`, add `isSuperAdmin` |
| `src/interfaces/user/user.controller.ts` | Full CRUD with `AuthGuard('jwt')` + `RolesGuard`, inject `UserService` |
| `src/interfaces/user/user.controller.spec.ts` | Replace e2e test with unit tests for all 5 endpoints |
| `src/modules/users/user.service.ts` | Add `getAll`, `update`, `delete`; fix `getByUserId` exception; fix `addUser` to use `model.create()` |
| `src/modules/users/user.service.spec.ts` | Remove `describe.skip`, replace `MongoMemoryServer` with jest mocks, add 11 tests |
| `src/app.module.ts` | Uncomment `UserModule` import |

---

## 7. Entity Design

```typescript
@Schema({ timestamps: true })
export class User {
  @ApiProperty() _id!: string
  @ApiProperty() @Prop({ required: true, unique: true }) uid!: string
  @ApiProperty() @Prop({ required: true }) firstName!: string
  @ApiProperty() @Prop({ required: true }) lastName!: string
  @ApiProperty() @Prop({ required: true, unique: true }) email!: string
  @ApiProperty() @Prop({ required: true, default: false }) isAdmin!: boolean
  @ApiProperty() @Prop({ required: true, default: false }) isSuperAdmin!: boolean
}
```

---

## 8. Service Design

```typescript
class UserService {
  create(dto: CreateUserDto): Promise<UserResponse>         // validate uid + email unique → model.create()
  getAll(): Promise<UserResponse[]>                         // model.find().exec() → mapper
  getByUid(uid: string): Promise<UserResponse>              // model.findOne({ uid }) → NotFoundException if null
  update(uid: string, dto: UpdateUserDto): Promise<UserResponse> // findOneAndUpdate → NotFoundException if null
  delete(uid: string): Promise<void>                        // findOneAndDelete → NotFoundException if null
}
```

---

## 9. DTO Design

**`CreateUserDto`**
```typescript
@IsString() @IsNotEmpty() uid!: string
@IsString() @IsNotEmpty() firstName!: string
@IsString() @IsNotEmpty() lastName!: string
@IsEmail() @IsNotEmpty() email!: string
@ApiHideProperty() @IsOptional() userId?: string   // RolesGuard injection passthrough
```

**`UpdateUserDto`** — `PartialType(CreateUserDto)` with:
```typescript
@IsBoolean() @IsOptional() isAdmin?: boolean
```

---

## 10. Implementation Order

| Step | Action | Files |
|---|---|---|
| 1 | Fix entity and response interface | `user.entity.ts`, `interfaces/user-response.ts` |
| 2 | Create mapper | `user.mapper.ts` |
| 3 | Create DTOs | `dto/create-user.dto.ts`, `dto/update-user.dto.ts`, `dto/user-uid.dto.ts` |
| 4 | Create Swagger decorators | 5 decorator files in `infrastructure/swagger/v2/` |
| 5 | Update service | `user.service.ts` — full CRUD |
| 6 | Create UserModule | `user.module.ts` |
| 7 | Update controller | `user.controller.ts` — inject `UserService`, full CRUD |
| 8 | Uncomment UserModule in AppModule | `app.module.ts` |
| 9 | Create test stubs | `src/helpers/mocks/users/user-detail.ts` |
| 10 | Rewrite service spec | `user.service.spec.ts` — jest mocks, 11 test cases |
| 11 | Rewrite controller spec | `user.controller.spec.ts` — unit tests, 7 test cases |

---

## 11. Makefile Validation Workflow

```
Step 1–4  →  make lint
Step 5–6  →  make lint
Step 7–8  →  make lint
Step 9    →  (no validation needed)
Step 10   →  make lint && make unit-tests-v2
Step 11   →  make lint && make unit-tests-v2
Final     →  make unit-tests
```

---

## 12. Seed Update

Add a `seedUsers` phase to `scripts/seed-data.js` that runs **before** headquarters and conferences:

- Source data mirrors `mongo-init.js` `users` array (uid, firstName, lastName, email, isAdmin)
- POST each user to `POST /v2/users`; HTTP 400 "already exists" (uid or email) → skip
- Exit 1 if any user fails for a reason other than duplicate

Updated order in `seed-data.js`:
1. Users (`POST /v2/users`)
2. Headquarters (`POST /v2/headquarters`)
3. Conferences (`POST /v2/conferences`)
