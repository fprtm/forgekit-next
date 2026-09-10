# T-001: RBAC Redesign — Glob Matching + Linear Hierarchy

**Findings**: #1 (critical — can() wildcard broken)
**Depends on**: —
**Blocks**: T-003, T-005

## Scope

Rewrite `src/modules/auth/domain/policies.ts`:
1. Add `ROLE_HIERARCHY` — linear chain: `super_admin > admin > user`
2. Add `getEffectivePermissions(role)` — collects own + inherited
3. Add `matchPermission(pattern, action)` — supports `'**'`, `'namespace:*'`, exact match
4. Rewrite `can()` — collect effective permissions, match with glob, then run ABAC/ownership
5. Shrink `ROLE_PERMISSIONS` — each role only declares own additions
6. Replace `authPolicies.setSuperRoles()` with `authPolicies.setHierarchy()`
7. Update `products/domain/policies.ts` if it calls `setSuperRoles()`

## DoD

- [ ] `matchPermission('**', 'anything')` returns true
- [ ] `matchPermission('products:*', 'products:read')` returns true
- [ ] `matchPermission('products:*', 'users:read')` returns false
- [ ] `matchPermission('products:read', 'products:read')` returns true (exact)
- [ ] `can(superAdmin, 'products:update')` returns true (was: false — the critical bug)
- [ ] `can(superAdmin, 'impersonate')` returns true
- [ ] `can(admin, 'products:read')` returns true (inherited from user)
- [ ] `can(user, 'settings:write')` returns false (not inherited)
- [ ] `can(null, anything)` returns false
- [ ] ABAC/ownership checks unchanged — existing `policies.test.ts` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] `policies.test.ts` updated with new hierarchy + glob tests
