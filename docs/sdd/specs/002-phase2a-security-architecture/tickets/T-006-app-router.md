# T-006: App Router Pages → Server Actions

**Findings**: #7 (high — 7+ pages instantiate repos), #32 (medium — role filtering in pages)
**Depends on**: T-002 (auth types), T-004 (users module fixed)
**Blocks**: —

## Scope

### Pages to Fix
Each page currently imports `Drizzle*Repository` + handler directly. Refactor to call Server Actions only:

1. `src/app/d/products/page.tsx` → call `getProductsAction`
2. `src/app/d/products/[id]/edit/page.tsx` → call `getProductAction(id)`
3. `src/app/d/profile/page.tsx` → call `getUserProfileAction`
4. `src/app/d/users/accounts/page.tsx` → call `getUsersAction({ role: 'all' })`
5. `src/app/d/users/admins/page.tsx` → call `getUsersAction({ role: 'admin' })`
6. `src/app/d/users/users/page.tsx` → call `getUsersAction({ role: 'user' })`
7. `src/app/d/users/[id]/edit/page.tsx` → call `getUserAction(id)`

### Role Filtering (Finding #32)
Move role filtering from page to handler:
- Add `role?: UserRole | 'all'` param to `GetUsersHandler` command
- Handler applies role filter in repo query
- Pages pass the role param to the Server Action
- Remove inline `.filter(u => u.role === ...)` from pages

### New/Updated Server Actions
- `getUsersAction({ role })` — if not exists, create in `users/presentation/http/actions/`
- `getUserAction(id)` — single user fetch
- `getUserProfileAction` — uses refactored handler from T-004

## DoD

- [ ] Zero `Drizzle*Repository` imports in any file under `src/app/`
- [ ] Zero use-case handler instantiation in any file under `src/app/`
- [ ] `grep -rn "DrizzleProductRepository\|DrizzleUserRepository" src/app/` returns zero results
- [ ] Role filtering happens in `GetUsersHandler`, not in page components
- [ ] All pages call Server Actions for data fetching
- [ ] Existing e2e tests pass (URLs unchanged)
- [ ] `bun run typecheck` passes
