# T-003: Security Hardening Batch

**Findings**: #2 (IDOR), #4 (getSettingAction no auth), #5 (middleware), #6 (stack trace leak), #15 (CSRF), #16 (API key), #17 (rate limiting)
**Depends on**: T-001 (RBAC must work before auth checks are meaningful)
**Blocks**: —

## Scope

7 independent security fixes, batched because each is small:

### 3a. IDOR — markAsRead (Finding #2)
- `notification.actions.ts:markAsReadAction` — add ownership check: fetch notification, verify `userId === session.user.id`
- `route-handlers.ts` — same fix for the API route version
- Add `userId` param to `INotificationRepository.markAsRead(id, userId)` and enforce in SQL WHERE

### 3b. getSettingAction Auth (Finding #4)
- Add `auth()` + `can(user, 'settings:read')` check before query
- Match pattern of all other setting actions

### 3c. Middleware /api/* Auth (Finding #5)
- Change matcher to: `"/((?!_next/static|_next/image|favicon.ico|api/auth|api/webhooks).*)"`
- Keep individual `auth()` in route handlers as defense-in-depth

### 3d. Stack Trace Leak (Finding #6)
- All 8+ action files: replace `error instanceof Error ? error.message : "Internal error"` with DomainException-specific check + `logger.error` + `"Internal Server Error"` for all others
- Affected: `product.actions.ts`, `user.actions.ts`, `setting.actions.ts`, `audit-log.actions.ts`

### 3e. stopImpersonation CSRF (Finding #15)
- Add `verifyCsrfToken(req)` to stopImpersonation in `impersonate.controller.ts`

### 3f. API Key Auth (Finding #16)
- Replace `apiKey !== process.env.INTERNAL_API_KEY` with `crypto.timingSafeEqual`
- When API key matches, set `authUser = SYSTEM_USER` (not `undefined`)

### 3g. Rate Limiting IP (Finding #17)
- Replace `x-forwarded-for` with `req.ip` or trusted header
- Remove `'unknown'` fallback — use socket address

## DoD

- [ ] markAsRead: returns 404 when notification belongs to different user
- [ ] getSettingAction: returns 401 without session, 403 without permission
- [ ] Middleware: `/api/v1/products` requires auth at middleware level
- [ ] Stack trace: non-DomainException errors return "Internal Server Error" (verified by throwing a generic Error in dev)
- [ ] stopImpersonation: rejects request without CSRF token
- [ ] API key: timing-safe comparison + SYSTEM_USER assigned
- [ ] Rate limiting: uses trusted IP source
- [ ] `bun run typecheck` + `bun run lint` passes
- [ ] Existing e2e tests pass
