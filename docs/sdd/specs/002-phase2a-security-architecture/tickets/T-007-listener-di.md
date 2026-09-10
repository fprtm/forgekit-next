# T-007: Listener DI + Composition Roots

**Findings**: #10 (high — auth handlers import framework), #11 (high — notification listeners instantiate repos), #12 (high — audit-uc composition)
**Depends on**: T-002 (auth types)
**Blocks**: T-008 (event wiring)

## Scope

### Notification Listeners
3 files currently instantiate `DrizzleNotificationRepository` and `DrizzleSettingRepository` directly:
- `notification.listener.ts`
- `notification-email.listener.ts`
- `notification-whatsapp.listener.ts`

Refactor: accept repository interfaces via constructor.

### Auth Listeners
- `auth-audit.listener.ts` — instantiates `DrizzleAuditLogRepository` directly → inject `IAuditLogRepository` via constructor

### Audit Module
- `audit-uc.ts` — instantiates `DrizzleAuditLogRepository` directly → inject `IAuditLogRepository` via constructor

### Auth Handlers — Framework Extraction
- Create `IAuthProvider` interface in `auth/domain/services/`:
  ```typescript
  interface IAuthProvider {
    signIn(credentials: SignInCredentials): Promise<SignInResult>;
    signOut(): Promise<void>;
  }
  ```
- Create `ISessionStore` interface for cookie operations:
  ```typescript
  interface ISessionStore {
    setCookie(key: string, value: string, options: CookieOptions): void;
    getCookie(key: string): string | undefined;
    deleteCookie(key: string): void;
  }
  ```
- Create implementations in `auth/infrastructure/services/`
- `ImpersonateUserHandler` — depends on `ISessionStore` instead of `cookies()` directly
- `LoginHandler` / `LogoutHandler` — already dead code (removed in T-011), no need to refactor

### Composition Root for Listeners
`EventDispatcher.initializeListeners()` becomes the place where concrete repos are passed to listener constructors. This may require refactoring the dynamic import pattern.

## DoD

- [ ] Zero `Drizzle*Repository` instantiation in any `application/` file
- [ ] Zero `new Drizzle*` in any listener file
- [ ] `IAuthProvider` and `ISessionStore` interfaces in `auth/domain/`
- [ ] `ImpersonateUserHandler` depends on `ISessionStore`, not `cookies()` directly
- [ ] `audit-uc.ts` accepts `IAuditLogRepository` via constructor
- [ ] All listeners accept repos via constructor
- [ ] `grep -rn "new Drizzle" src/modules/*/application/` returns zero results
- [ ] `bun run typecheck` passes
