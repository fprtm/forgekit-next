# SDS — Phase 2a: Security, Architecture & Domain Model

Refs: ADR-001, ADR-002, `reports/2026-09-09-full-codebase-audit.md` (52 findings, 22 in scope for this phase)

## Scope

Phase 2a fixes all **critical** (6) and **high** (16) audit findings plus the anemic domain model (promoted from medium). This covers: broken RBAC, IDOR, auth bypass, dependency rule violations, dead event plumbing, missing DB constraints, and entity refactoring. Phase 2b (medium/low/polish) follows separately.

## 1. RBAC Redesign — Glob Matching + Linear Hierarchy

### Current Problem
`can()` checks `permissions.includes(action)` (literal match) before the `SUPER_ROLES` bypass. Since super_admin has `['**']`, `Array.includes('products:update')` is always false. The function returns false before reaching the SUPER_ROLES shortcut. super_admin is denied ALL actions.

### Design

**Linear hierarchy**: `super_admin` > `admin` > `user`. Each role inherits all permissions of roles below it.

```typescript
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  super_admin: ["admin", "user"],
  admin: ["user"],
  user: [],
};

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["impersonate"],
  admin: [
    "users:create", "users:read", "users:update", "users:delete",
    "settings:read", "settings:write",
  ],
  user: [
    "products:create", "products:read", "products:update", "products:delete",
    "notifications:read", "notifications:write",
  ],
};
```

Each role only declares its **own** permissions. `getEffectivePermissions(role)` collects own + inherited.

**Glob matching**: `matchPermission(pattern, action)` supports:
- `'**'` → matches everything
- `'products:*'` → matches any action in the `products` namespace
- `'products:read'` → exact match (current behavior)

```typescript
function matchPermission(pattern: string, action: string): boolean {
  if (pattern === "**") return true;
  if (pattern.endsWith(":*")) {
    return action.startsWith(pattern.slice(0, -1));
  }
  return pattern === action;
}
```

**Revised `can()` flow**:
1. Guard: `!user || !user.role` → false
2. Collect effective permissions: own + inherited roles
3. Match: `effectivePermissions.some(p => matchPermission(p, action))`
4. If no match → false
5. If match + no resourceContext → true
6. If match + resourceContext → run validators (ABAC/ownership, unchanged from current)

### Migration
- `ROLE_PERMISSIONS` shrinks (each role only lists own additions)
- `SUPER_ROLES` array replaced by hierarchy lookup
- All existing `can()` call sites unchanged (same function signature)
- `authPolicies.setSuperRoles()` → `authPolicies.setHierarchy()` (rename)

## 2. Auth Command Types — User Required

### Current Problem
Mutation commands define `user?: AuthUser` as optional. Handlers use `if (currentUser) { if (!can(...)) throw }` — omitting user silently skips auth.

### Design
Split command types:
```typescript
interface AuthenticatedCommand {
  user: AuthUser; // required, not optional
}

interface CreateProductCommand extends AuthenticatedCommand {
  name: string;
  price: number;
  // ...
}
```

All mutation use-case handlers receive `AuthenticatedCommand`-extended commands. The composition root (Server Action / route handler) is the only place where `auth()` is called and `user` is extracted — if no session, the action returns early with 401 before reaching the handler.

Read-only handlers (GetProducts, GetProduct) may keep `user?: AuthUser` for filtering purposes (e.g., only show own products to `user` role).

### Affected Handlers
- `CreateProductHandler`, `UpdateProductHandler`, `DeleteProductHandler`
- `CreateUserHandler`, `ResetPasswordHandler`, `UpdateProfileHandler`
- `GetProductHandler`, `GetProductsHandler` (remain optional — read-only)

## 3. Security Hardening (Batch)

### 3a. IDOR — Notification markAsRead
Add ownership verification:
```typescript
// In markAsReadAction and route handler:
const notification = await notificationRepo.findById(id);
if (!notification || notification.userId !== session.user.id) {
  return { success: false, error: "Not found", data: null };
}
await notificationRepo.markAsRead(id);
```
Alternative: add `userId` parameter to `markAsRead(id, userId)` and enforce in SQL WHERE clause.

### 3b. getSettingAction — Add Auth
```typescript
export async function getSettingAction(key: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized", data: null };
  if (!can(session.user, "settings:read")) return { success: false, error: "Forbidden", data: null };
  // ... existing logic
}
```

### 3c. Middleware — Include /api/* in Auth
Change matcher to only exclude truly public routes:
```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks).*)",
  ],
};
```
Individual route handlers keep their own `auth()` calls as defense-in-depth (don't remove).

### 3d. Stack Trace Leak — All Server Actions
Standardize error handling pattern across all action files:
```typescript
} catch (error: unknown) {
  if (error instanceof DomainException) {
    return { success: false, error: error.message, data: null };
  }
  logger.error("ACTION_NAME", error);
  return { success: false, error: "Internal Server Error", data: null };
}
```
Replace `console.error` with `logger.error` in the same pass.

### 3e. stopImpersonation CSRF
Add `verifyCsrfToken(req)` matching the `impersonate` method.

### 3f. API Key Auth — Set System User
When API key matches, assign a system-level `AuthUser` instead of `undefined`:
```typescript
const SYSTEM_USER: AuthUser = { id: "system", role: "super_admin" };
if (apiKey === process.env.INTERNAL_API_KEY) {
  authUser = SYSTEM_USER;
}
```
Use `crypto.timingSafeEqual` for key comparison.

### 3g. Rate Limiting — Trusted IP
Replace `x-forwarded-for` with `req.ip` or a trusted header (e.g., `CF-Connecting-IP` for Cloudflare). Never fall back to `'unknown'` shared bucket — use the socket address as last resort.

## 4. Dependency Rule Fixes

### 4a. IUserRepository Extension
Add profile methods to the interface:
```typescript
interface IUserRepository {
  // ... existing methods
  findProfileByUserId(userId: string): Promise<UserProfile | null>;
  upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
}
```
Implement in `DrizzleUserRepository`. Remove all `db`/`drizzle-orm` imports from `get-user-profile.handler.ts` and `update-profile.handler.ts`.

### 4b. App Router Pages → Server Actions
For each page that directly instantiates repos (`products/page.tsx`, `products/[id]/edit/page.tsx`, `profile/page.tsx`, `users/accounts/page.tsx`, `users/admins/page.tsx`, `users/users/page.tsx`, `users/[id]/edit/page.tsx`):
1. Create or use existing Server Action in the module's `presentation/http/actions/`
2. Page calls the Server Action only
3. Server Action is the composition root (instantiates repo + handler, catches errors)

For user role filtering in admins/users pages: add a `role` filter parameter to `GetUsersHandler` instead of filtering in the page.

### 4c. Setting Module Full Rebuild
Create missing handlers:
- `GetAllSettingsHandler` — replaces direct `settingRepo.findAll()`
- `GetSettingsByCategoryHandler` — replaces direct `settingRepo.findByCategory()`
- `DeleteSettingHandler` — replaces direct `settingRepo.delete()`

Fix existing:
- Route `updateSettingAction` through `UpdateSettingHandler.execute()` (currently instantiated but never called)
- Resolve contradictory auth: remove the hardcoded "super_admin only" check from `UpdateSettingHandler`, use `can(user, "settings:write")` consistently
- Dispatch `SettingUpdatedEvent` in handlers

### 4d. Listener Dependency Injection
All listeners that currently instantiate repos directly:
- `notification.listener.ts`, `notification-email.listener.ts`, `notification-whatsapp.listener.ts`
- `auth-audit.listener.ts`
- `audit-uc.ts`

Refactor: accept repository interfaces via constructor. The event dispatcher's `initializeListeners()` becomes the composition root that passes concrete repos.

### 4e. Auth Module — Framework Extraction
Extract Next.js framework calls behind interfaces:
- `IAuthProvider` interface with `signIn()`, `signOut()` methods
- `ISessionStore` interface for cookie operations (impersonation)
- Implementations in `auth/infrastructure/services/`
- Handlers depend on interfaces only

## 5. Domain Events Wiring

### Dead Events → Wire or Delete
| Event | Decision |
|-------|----------|
| `UserLoggedInEvent` | Wire: dispatch from `auth.config.ts` signIn callback (the actual login path, not the dead LoginHandler) |
| `UserLoggedOutEvent` | Wire: dispatch from Server Action that calls signOut() |
| `SettingUpdatedEvent` | Wire: dispatch from rebuilt `UpdateSettingHandler` |
| `AuditLogCreatedEvent` | Delete: audit log creation IS the side effect — it doesn't need its own event |

### Missing Dispatches
Add `eventDispatcher.dispatch()` to:
- `MarkAllNotificationsReadHandler`
- `UpdateUserSettingHandler` (notifications)
- `LogActionHandler` (audit-logs)
- Setting handlers (from rebuild, §4c)

### Orphan Events
`UserPasswordResetEvent` — add a listener (email notification to user that password was reset).

## 6. Database Schema — Constraints + Indexes

### Constraints
```typescript
// accounts: add composite primary key
export const accounts = pgTable("accounts", {
  // ... columns
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));

// user_profiles: unique on userId
// ... unique constraint

// notifications: FK on userId
// audit_logs: FK on actorId with onDelete: "set null"
// verification_tokens: unique on (identifier, token)
```

### Indexes
```typescript
// notifications
notificationsUserIdIdx: index("notifications_user_id_idx").on(table.userId),
notificationsReadIdx: index("notifications_read_idx").on(table.userId, table.read, table.createdAt),

// audit_logs
auditLogsActorIdx: index("audit_logs_actor_idx").on(table.actorId, table.createdAt),
auditLogsEntityIdx: index("audit_logs_entity_idx").on(table.entityName, table.entityId),

// user_profiles
userProfilesUserIdIdx: index("user_profiles_user_id_idx").on(table.userId),
```

Migration: generate via `bun run drizzle-kit generate`, review SQL, apply. Idempotent — adding constraints/indexes doesn't modify existing data (unless constraint is violated by existing rows — verify first).

## 7. Entity Class Refactor (Anemic Domain → Rich Domain)

### Pattern
Each entity becomes a class with:
- Private constructor
- `static create(props)` — validates via value objects, throws DomainException if invalid. Used for new entity creation.
- `static reconstruct(raw)` — no validation, used when loading from DB. Trusts persisted data.
- Behavioral methods where applicable (e.g., `product.updatePrice(newPrice)`, `user.changeRole(newRole)`)
- Getters for properties (immutable from outside)

```typescript
export class ProductEntity {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly price: PriceValueObject,
    readonly sellerId: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: CreateProductProps): ProductEntity {
    const price = PriceValueObject.create(props.price);
    // ... other validations
    return new ProductEntity(
      crypto.randomUUID(), props.name, price,
      props.sellerId, new Date(), new Date(),
    );
  }

  static reconstruct(raw: ProductRow): ProductEntity {
    return new ProductEntity(
      raw.id, raw.name,
      PriceValueObject.reconstruct(raw.price),
      raw.sellerId, raw.createdAt, raw.updatedAt,
    );
  }

  updatePrice(newPrice: number): ProductEntity {
    const price = PriceValueObject.create(newPrice);
    return new ProductEntity(
      this.id, this.name, price,
      this.sellerId, this.createdAt, new Date(),
    );
  }
}
```

### Affected Entities
- `ProductEntity` — use `PriceValueObject`
- `UserEntity` — use `EmailValueObject`
- `Setting` — fix `SettingKeyValueObject` regex (UPPERCASE → lowercase)
- `NotificationEntity` — basic class conversion
- `AuditLogEntity` — fix `AuditActionValueObject` format incompatibility

### Repository Changes
Repositories return entity classes instead of plain objects. `reconstruct()` is called in the repository's mapping layer. Handlers work with entity methods instead of raw data manipulation.

## 8. Dashboard — Remove Fake Stats + Add Domain Layer

### Remove
Delete all fabricated metrics from `overview.tsx`:
- Revenue calculation (`totalProducts * 1250 + 24500`)
- Operations count
- Fake latency/uptime
- Fake weekly bar chart
- Fake "System Health" panel

### Keep (real data)
- Product count (from `GetDashboardStatsHandler`)
- User count
- Any other metrics sourced from actual DB queries

### Domain Layer
Create `src/modules/dashboard/domain/`:
- `repositories/stat-reader.interface.ts` — move `IStatReader` from handler
- `entities/dashboard-stats.ts` — move `DashboardStats` type

## 9. Dead Code Purge (Phase 2a portion)

Only dead code directly related to high-severity findings:
- `LoginHandler`, `LogoutHandler`, `RefreshTokenHandler` (fully dead, #13)
- `AuditLogCreatedEvent` (decided to delete, §5)
- Controllers: defer to Phase 2b (medium severity)
- Constants/value-objects/exceptions: defer to Phase 2b

## 10. Type Safety

- `EventDispatcher`: replace `EventHandler<any>[]` with `EventHandler<DomainEvent>[]`
- Remove `eslint-disable` comment
- `users/form/index.tsx`: fix `as any` by deriving form types from Zod schema via `z.infer<>`

## Non-goals for Phase 2a

- Naming convention alignment (INotificationRepository, save→create) → Phase 2b
- Dark mode fixes → Phase 2b
- Env validation gaps → Phase 2b
- Settings UI refactor (react-hook-form) → Phase 2b
- E2E test improvements → Phase 2b
- Accessibility → Phase 2b
- shadcn wrapper extraction → Phase 2b
- Test coverage for setting/audit-logs/dashboard → separate ticket after module fixes land
