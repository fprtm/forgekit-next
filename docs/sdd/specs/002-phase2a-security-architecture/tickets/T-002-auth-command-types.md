# T-002: Auth Command Types — User Required

**Findings**: #3 (critical — auth bypass via optional user)
**Depends on**: —
**Blocks**: T-004, T-005, T-006, T-007, T-010

## Scope

1. Create `AuthenticatedCommand` interface in `src/shared/domain/` or `src/shared/types/`:
   ```typescript
   interface AuthenticatedCommand {
     user: AuthUser; // required
   }
   ```
2. All mutation command types extend `AuthenticatedCommand`:
   - `CreateProductCommand`, `UpdateProductCommand`, `DeleteProductCommand`
   - `CreateUserCommand`, `ResetPasswordCommand`, `UpdateProfileCommand`
3. Read-only commands keep `user?: AuthUser` (optional for filtering)
4. Handler code simplified: remove `if (currentUser)` guards — TypeScript guarantees user exists
5. Composition roots (Server Actions + route handlers) must extract `user` from session before calling handler — if no session, return 401 before reaching handler

## DoD

- [ ] `AuthenticatedCommand` interface created
- [ ] All 6 mutation commands extend it with required `user`
- [ ] All 6 mutation handlers remove `if (currentUser)` conditional — `can()` called unconditionally
- [ ] All Server Actions for mutations: `auth()` → if no session, return 401 → pass `user` to handler
- [ ] All route handlers for mutations: same pattern
- [ ] Read-only commands unchanged (user remains optional)
- [ ] `bun run typecheck` passes (compile-time verification that all callers provide user)
- [ ] Existing unit tests updated to always provide user in mutation commands
- [ ] `bun run test` passes
