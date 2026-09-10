# Consolidated Audit Report — forgekit-next

**Date**: 2026-09-09
**Supersedes for reading purposes**: `2026-09-09-full-codebase-audit.md`, `2026-09-09-ux-functional-audit.md`, `2026-09-09-security-ui-deep-dive.md` (kept as-is for historical/detailed trail — this document merges, deduplicates, and status-tracks all three so there's one place to see what's left to do).
**Total unique findings across all three audits**: 52 (architecture) + 17 (UX/functional) + security/UI deep-dive ≈ **80+ findings**, of which **~35 are already fixed** (Phase 1 + Phase 2a, implemented and runtime-verified the same day) and **~45 remain outstanding**, organized below by priority.

---

## ✅ Already Fixed — Phase 1 + Phase 2a (implemented, runtime-verified, not yet committed)

Branch `phase-1-2a-implementation`. Verified live in browser (login, CRUD, impersonate, settings save, notifications), not just typecheck/lint.

- RBAC wildcard bug (super_admin locked out of everything) — redesigned as permission hierarchy
- IDOR in notification `markAsRead` — ownership check added
- Auth bypass via optional `user` field — now required at the type level (`AuthenticatedCommand`)
- `getSettingAction` missing auth — fixed
- Middleware excluding all `/api/*` from auth — fixed
- Stack trace leaks in 8+ Server Actions — masked properly
- 7+ `app/d/**/page.tsx` bypassing Server Actions — routed through actions
- `get-user-profile`/`update-profile` importing DB directly — routed through repository
- Setting module bypassing Application layer entirely — full rebuild with proper use-cases
- Auth/notification/audit-log listeners instantiating repos directly — dependency-injected
- Dead `LoginHandler`/`LogoutHandler`/`RefreshTokenHandler` — deleted
- 4 dead domain events — wired to real dispatch points or deleted
- `stopImpersonation` missing CSRF — added
- Product API key bypass (timing-unsafe compare, RBAC bypass) — fixed with `timingSafeEqual` + system user
- Rate limiting via spoofable `x-forwarded-for` — replaced with trusted IP source
- Missing DB constraints (PK, FK, unique) + zero indexes — migration generated (not yet applied to a real DB)
- Dashboard missing domain layer + fabricated metrics — real domain layer added, fake stats removed
- `EventDispatcher` using `any[]` — properly typed
- `as unknown as Entity` casts (7×) — removed via proper entity reconstruction
- Anemic domain model (all entities were plain interfaces) — converted to classes with `create()`/`reconstruct()`/`toJSON()`
- App-router role filtering — moved into the handler layer
- Missing event dispatches (5 handlers) — added
- `audit-log.actions.ts` missing `"use server"` — added (found and fixed during runtime verification, not part of the original ticket list)
- `EventDispatcher` silently swallowing rejected promises — now logged

**Also done this session, outside the original findings**: renamed app from placeholder "PsyCare Booking" branding to "ForgeKit"; added 101 `data-testid` attributes across all modules; fixed 3 runtime-only bugs invisible to typecheck (missing `pino-pretty` dependency, FK-violating seed data, RSC serialization of entity classes across 5 modules — the last one required adding `toPlain()` calls at every Server Action boundary).

---

## 🔴 Critical — Outstanding

1. **71 dependency vulnerabilities, 5 critical — including unauthenticated RCE.** `next@16.2.6` has an unauthenticated RCE on Windows-hosted servers and another in the Image Optimization API (AVIF files) — fixed in ≥16.3.3. `next-auth@5.0.0-beta.31` can fail-open on config errors and has an email-normalizer homoglyph bypass. **Run `bun audit fix` before anything else ships.** Not yet done.

## 🟠 High — Outstanding

2. **No self-service password change.** Only an admin can reset a user's password (to a random string). A `user`-role person has no way to voluntarily change their own password.
3. **"Forgot password?" is a dead link** (`href="#"`). No recovery path exists for a logged-out user at all.
4. **Registration has no UI.** Backend (`/api/auth/register`, `RegisterUserHandler`) is fully built; no `/register` page exists anywhere. Decide intentionally (build the page, or confirm this is meant to be invite-only) — silent unreachability is the actual problem, not the absence of self-signup per se.
5. **Settings unreachable from the primary sidebar nav.** Reachable only via the avatar/footer dropdown. Root cause: any menu item with `children` renders as a pure expand/collapse toggle with no `href` — Settings' only child points to Notifications, not the settings root.
6. **3 modules (setting, audit-logs, dashboard) have zero test coverage** — including the security-critical audit trail.
7. **CSP header still missing.** Other security headers are present; `Content-Security-Policy` is not.

## 🟡 Medium — Outstanding

8. **Setting module's 4 forms don't use the app's established form pattern.** `business-form.tsx`, `payment-form.tsx`, `policy-form.tsx`, `integration-form.tsx` use raw `useState` + manual `if/toast.error` chains instead of react-hook-form + Zod (unlike every other form in the app). `integration-form.tsx` has no client-side validation at all. Same 4 files also bypass shared `Select` (raw `<select>`) and `Button`'s `variant="destructive"` (hand-themed via className).
9. **`Card` component bypassed in 9 files** (`users`/`products` list/create/edit/profile pages) — hand-rolled `bg-white p-6 border rounded-lg shadow-sm` instead. This is the direct cause of finding #11 below (dark mode breakage): `Card` uses the theme-aware `bg-card` token, the hand-rolled divs hardcode `bg-white`.
10. **6 destructive/reset actions use native browser `confirm()`** instead of the shadcn `Dialog`/`AlertDialog` pattern already used elsewhere (delete user, delete product, 4× "reset to defaults" in Setting).
11. **10 files render `bg-white` with no `dark:` counterpart** — bright white cards in dark mode (see #9, same root cause).
12. **No password visibility toggle anywhere**, including for opaque API secrets (Midtrans/Fonnte keys in Settings → Integrations) where a typo is invisible until the integration silently fails.
13. **Three incompatible page-header patterns** across products/users vs. setting/notifications vs. dashboard — different wrapper structure, icon-badge presence, font-weight, and color-token usage for the same conceptual element.
14. **No seeder safety guard.** No seeder checks `NODE_ENV` before running — `bun run db:seed` against a production `DATABASE_URL` would silently upsert known-password admin accounts. (Seeders also log plaintext seed passwords to console — fine for local dev, worth gating behind the same guard.)
15. **~7 spacing-scale outliers** (e.g. `gap-4.5`, `space-y-5`, `space-y-1`, `p-1` used once each against a clearly dominant scale) and **3 competing vertical-rhythm conventions** across modules. No arbitrary bracket values found — good.
16. **Zero transaction usage** beyond the one added in Phase 2a (`upsertProfile`) — other multi-step mutations aren't wrapped atomically.
17. **Remaining dead code from the original audit not in Phase 2a's scope**: 4 unused controller files, 8 unused domain exceptions, 7 dead shared constant files, `UserRole` defined twice (`roles.ts` + `constant/role.ts`).
18. **Naming inconsistencies**: `NotificationRepository` (no `I` prefix) vs. every other `I*Repository`; `save()` vs `create()`; `findAll()` vs `findMany()`.
19. **Env vars bypassing the validated schema**: `LOG_LEVEL`, `NEXT_PUBLIC_APP_URL` (site.ts fallback), `UPSTASH_REDIS_REST_URL` read directly from `process.env` instead of through `env.ts`.
20. **API routes accepting raw request bodies without Zod validation** in several handlers — mass-assignment risk.
21. **Password policy inconsistent**: login accepts 6-char minimum, registration requires 8.
22. **Settings tabs are a custom `<button>` toggle**, not shadcn's `Tabs` — no `role="tablist"`/`aria-selected`/`aria-controls`.
23. **Products/Users tables have no dedicated empty state** — falls through to a generic "No results." cell, unlike Notifications' polished empty state.

## 🟢 Low — Outstanding

24. Reset-password-result dialog: `<label>` with no `htmlFor`, `<Input>`s with no `id` — not screen-reader associated.
25. Copy-to-clipboard icon buttons in that dialog have no `aria-label`.
26. Email fields validate on submit only (RHF default), not live on first pass.
27. No required-field visual markers anywhere (asterisk/label).
28. Product price input allows typing negative numbers at the input level (rejected on submit via Zod, just later than necessary).
29. Notification read/unread dot is color-only (redundant with bold text + row tint, so not a hard violation).
30. Icon sizing outliers: `size-4` mixed with `h-4 w-4` in 4 files; one `h-4.5 w-4.5`.
31. Heading font-weight inconsistency (`font-bold` vs `font-extrabold` at the same hierarchy level).
32. `rounded` vs `rounded-lg` inconsistency (`products/list.tsx`, `dashboard/overview.tsx`).
33. shadcn `button.tsx`/`avatar.tsx` modified with custom variants — should be wrapped instead, per the project's own component-boundary contract.
34. E2E tests use hardcoded `waitForTimeout()` and serial tests with shared state (flaky-test risk).
35. Misc dead exports: `waitForTyping`, `NewUser` type, duplicate `loginSchema`.
36. Missing Error Boundary in `DashboardLayout`; `currentUser` prop drilling; one unnecessary `"use client"`.
37. `Badge` component underused — several status/priority indicators are raw styled `<div>`s instead.
38. 2 stray inline `<svg>` in the `auth` module where a Lucide icon would be the norm elsewhere.
39. CSRF token accepted from request body as a fallback in addition to header — weakens the protection.

## ℹ️ Info / Accepted / No Action Needed

- Midtrans webhook is a true no-op stub (doesn't process anything, so not exploitable) — needs building for real before going live, not an active vulnerability.
- Cookie/session config relies on safe NextAuth defaults — fine as-is.
- Mobile/responsive layout verified solid (sidebar collapse, grid stacking, table scroll containment) — no fixes needed.
- Notification settings, edit-form pre-fill, delete feedback, focus management, non-semantic `onClick` — all checked and correct, no issues found.
- `Input` component usage is 100% consistent (no raw `<input>` found).
- `login.handler.ts`/`impersonate-user.handler.ts` importing NextAuth primitives directly — accepted pragmatic exception (no reasonable port/adapter exists for Auth.js's own session calls).

---

## Suggested Order of Attack

1. **`bun audit fix`** — critical RCE, do this literally before anything else touches this codebase again.
2. **Settings sidebar nav fix** — smallest change, matches the user's own reported experience directly.
3. **Self-service password change + working "Forgot password"** — closes the biggest support/security gap for anyone who actually deploys this.
4. **Registration UI decision** — build it or explicitly document "invite-only by design."
5. **Unify Setting module onto react-hook-form + Zod + shared Select/Button/Card** — one refactor closes findings #8, #9, #11 (partially) at once, since they're all the same root habit (setting module never adopted the app's shared primitives).
6. **CSP header + seeder `NODE_ENV` guard** — both quick, both real security hardening.
7. Everything else (dead code cleanup, naming, spacing outliers, accessibility polish) — batch into Phase 2b, no urgency.

## Judgment Gate

**Confidence**: HIGH on everything carried over from the three source reports — each was independently verified there (direct code read, live browser test, or `bun audit`'s own advisory data), not re-verified again in this merge. This document is a reorganization, not a new investigation.
**Honest blind spot**: same as the three source reports — `bun audit fix`'s actual safety hasn't been tested, and the UI/spacing findings describe data for a design decision, not settled "correct" answers.
