---
status: settled
date: 2026-09-09
---

# ADR-002: Phase 2 scope expanded — fix confirmed Dependency Rule violations

## Context

A code audit (grep + manual read, not assumption) of all modules found real, confirmed violations of this repo's own `AGENTS.md` architecture rules — not folder/naming issues, actual dependency-rule breaks. Full findings below. Reference: ADR-001 (`001-design-system-restructure-phasing.md`) defined Phase 2 as "migrate one existing module (`products`) to the new structure as the reference implementation." These fixes are folded into that same phase since `products` and `users` — the modules meant to become the reference example — are exactly where the violations live.

## Confirmed findings

### 🔴 High — repeated pattern
1. **7+ files under `src/app/d/**/page.tsx`** (`products/page.tsx`, `users/accounts/page.tsx`, `users/users/page.tsx`, `users/admins/page.tsx`, `profile/page.tsx`, and others) instantiate `Drizzle*Repository` + a use-case handler directly inside the App Router page, instead of calling the existing Server Action (e.g. `getProductsAction`). This duplicates composition-root wiring in the wrong layer and skips the `DomainException` catch/mask contract those Server Actions already implement — an unhandled throw here can leak an internal error message or stack trace to the client. Violates `AGENTS.md` §1 ("Zero Business Logic in App Router").
2. **`src/modules/users/application/use-cases/update-profile/update-profile.handler.ts`** and **`get-user-profile/get-user-profile.handler.ts`** import `db` and the Drizzle `userProfiles` schema directly and run queries inside the Application layer — `IUserRepository` has no method for profile data, so these handlers bypass the repository abstraction entirely rather than extending the interface.

### 🟡 Medium
3. **`src/modules/audit-logs/application/use-cases/audit-uc.ts`** instantiates `DrizzleAuditLogRepository` inside `application/` rather than at a composition boundary (module has no `presentation/http/actions` composition root of its own, since it's an internal listener-only module).
4. **Generic `Error` thrown instead of `DomainException`**: `auth/application/use-cases/refresh-token/refresh-token.handler.ts:6` and `setting/application/use-cases/update-setting/update-setting.handler.ts:12`. Inconsistent with the same module family doing it correctly elsewhere (e.g. `update-profile.handler.ts` uses `UnauthorizedException`).

### 🟢 Accepted trade-off, not a bug
5. `auth/application/use-cases/login/login.handler.ts` calls NextAuth's `signIn()` directly from the Application layer — technically infrastructure leaking inward, but treated as an accepted exception since `signIn`/`auth()` is Auth.js's canonical session primitive and there is no reasonable port/adapter abstraction for it in this stack. No action needed.

### 🔴 High — round 2 (setting module + type safety), found in follow-up audit
6. **`setting` module's Presentation layer bypasses Application layer entirely.** `presentation/http/actions/setting.actions.ts`'s `getSettingsAction`, `updateSettingAction`, `deleteSettingAction` call `settingRepo.upsert()/.delete()/.findAll()` directly instead of going through a use-case handler — no use-cases for list/getByCategory/delete were ever built, forcing the action layer to reach past Application into Infrastructure. Consequence: `UpdateSettingHandler` is instantiated in the action file but **never actually called** (dead code), and it contains its own authorization rule ("only super_admin can update settings", `update-setting.handler.ts:12`) that is completely different from the rule actually enforced (`can(user, "settings:write")` at the action layer) — two contradictory authorization policies exist for the same operation, only one of which is live.
7. **`getSettingAction` (singular getter) has zero authorization check** — every other function in the same file checks `can()`; this one doesn't even call `auth()`. Real access-control gap, not just inconsistency.

### 🟡 Medium — round 2
8. `: any` / `as any` in `users/presentation/ui/components/form/index.tsx:31-32` — violates the repo's own "No `any` Types Allowed" rule (README + AGENTS.md intent). Single file, low effort to fix.
9. `console.log/error/warn` used directly in ~20 files instead of the centralized `logger` (`@/shared/lib/logger`), which is already used correctly elsewhere (e.g. `event-dispatcher.service.ts`). Inconsistent production logging, weakens the "mask internal errors, log server-side" contract.

### 🟢 Informational — round 2
10. `reset-password.handler.ts` uses Node's `crypto.randomBytes` directly for temp-password generation — equivalent severity to `Math.random`, an accepted pragmatic exception (unlike password *hashing*, which correctly goes through `IPasswordHasher`).
11. Two `TODO`s in `notification-whatsapp.listener.ts` / `notification-email.listener.ts` mark WhatsApp/email providers as not yet wired to a real vendor (Fonnte, Resend/SendGrid) — honest placeholders, but mean the "multi-channel notifications" feature isn't production-functional out of the box for a fork.

## Decision

All 9 actionable findings above (#1–4, #6–9; #5 and #10-11 are accepted trade-offs/informational, no action) are fixed as part of Phase 2 (not immediately, not deferred indefinitely) — because Phase 2's stated purpose is making `products`/`users`/`setting` the trustworthy reference implementation, and shipping that reference with known Dependency Rule violations and a live authorization gap would defeat the phase's own purpose.

## Why (rule-of-three)

Hard to reverse once forked (third parties would copy the violating pattern as if it were the sanctioned one); surprising (the codebase's own `AGENTS.md` explicitly forbids exactly this); real trade-off (fixing now vs. bundling with Phase 2 — bundling chosen to avoid a third disconnected mini-effort when Phase 2 touches these same files anyway).

## Consequence

Phase 2's spec (when run via `/sdd-pipeline:spec`) must include these 4 fixes explicitly in its DoD, not just the "migrate to new folder structure" framing from ADR-001.
