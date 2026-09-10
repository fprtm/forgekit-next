# DoD — Phase 2a: Security, Architecture & Domain Model

Refs: `sds.md`, ADR-001, ADR-002, audit report

## Gate Criteria (all must pass)

### Security
- [ ] `can(superAdmin, 'products:update')` returns `true` (RBAC wildcard fixed)
- [ ] `can(admin, 'products:read')` returns `true` (hierarchy inheritance works)
- [ ] No mutation handler can be called without `user` field (TypeScript enforces)
- [ ] `markAsReadAction` rejects notification not owned by caller
- [ ] `getSettingAction` rejects unauthenticated callers
- [ ] Middleware checks auth on `/api/v1/*` routes
- [ ] No Server Action returns raw `error.message` for non-DomainException errors
- [ ] `stopImpersonation` validates CSRF token
- [ ] API key comparison uses `crypto.timingSafeEqual`
- [ ] Rate limiting uses trusted IP source, no `'unknown'` bucket

### Architecture (Dependency Rule)
- [ ] `grep -rn "from \"@/db\"" src/modules/*/application/` returns zero results
- [ ] `grep -rn "new Drizzle" src/modules/*/application/` returns zero results
- [ ] `grep -rn "DrizzleProductRepository\|DrizzleUserRepository" src/app/` returns zero results
- [ ] All listeners accept repo interfaces via constructor
- [ ] Setting module routes all operations through use case handlers
- [ ] `IAuthProvider` and `ISessionStore` interfaces exist in auth/domain/

### Domain Model
- [ ] All 5 entities are classes with `create()` + `reconstruct()` static factories
- [ ] All value objects used in entity `create()` methods
- [ ] Zero `as unknown as *Entity` casts in repositories
- [ ] `SettingKeyValueObject` accepts lowercase keys

### Events
- [ ] `UserLoggedInEvent` and `UserLoggedOutEvent` dispatch on actual login/logout
- [ ] `SettingUpdatedEvent` dispatches from `UpdateSettingHandler`
- [ ] `AuditLogCreatedEvent` deleted
- [ ] `UserPasswordResetEvent` has a listener
- [ ] `EventDispatcher` logs rejected promises

### Database
- [ ] Composite PK on accounts table
- [ ] Unique constraint on user_profiles(userId)
- [ ] FK constraints on notifications + audit_logs
- [ ] Indexes on all queried columns (4 indexes minimum)

### Dead Code
- [ ] `LoginHandler`, `LogoutHandler`, `RefreshTokenHandler` deleted
- [ ] Zero unused value objects (all used or deleted)

### Type Safety
- [ ] Zero `any` in `event-dispatcher.service.ts`
- [ ] Zero `as any` in users form component

### Dashboard
- [ ] Zero fabricated metrics
- [ ] Domain layer exists (`domain/repositories/`, `domain/entities/`)

### General
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `bun run test` passes (all existing + new tests)
- [ ] Existing e2e suite passes unchanged
- [ ] No behavioral change in URLs or user-facing flows (except: dashboard shows real data instead of fake)

## Test Plan

1. **Unit tests**: New tests for RBAC (glob matching, hierarchy), entity factories (valid + invalid), setting handlers
2. **Existing tests**: All must pass — regression gate
3. **Manual verification**: Dashboard renders, CRUD flows work, auth flows work
4. **Grep sweeps**: Mechanical checks listed in DoD (dependency rule, dead code)
5. **E2E**: Existing Playwright suite green
