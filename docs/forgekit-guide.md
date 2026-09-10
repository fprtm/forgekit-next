# ForgeKit — Deep-Dive Reference

> **This is not a getting-started guide.** For setup instructions, see [`README.md`](../README.md). For scaffolding a new module step-by-step, see [`adding-a-module.md`](adding-a-module.md). This document covers *why* specific subsystems (auth, seeding, impersonation, notifications, testing) are built the way they are, for anyone extending or modifying them.

---

## 1. Architecture: 4-Layer Taxonomy Per Module

Every module under `src/modules/<name>/` follows this structure. This is the **current, real** shape — verified directly against `products`, `users`, `setting`, `notifications`, and `audit-logs`:

```text
src/modules/<module-name>/
├── domain/                      # CORE — zero external dependencies
│   ├── entities/<name>.entity.ts        # classes with static create()/reconstruct() factories
│   ├── exceptions/<name>.exceptions.ts  # one grouped file, all DomainException subclasses
│   ├── repositories/<name>-repository.interface.ts
│   ├── value-objects/                   # only for fields with reused validation rules
│   └── events/<name>.events.ts
│
├── application/                 # USE CASES — orchestration, no framework/DB imports
│   ├── use-cases/<action-name>/
│   │   ├── <action>.command.ts   # extends AuthenticatedCommand for mutations
│   │   ├── <action>.dto.ts
│   │   └── <action>.handler.ts
│   ├── services/                 # event listeners, cross-cutting facades
│   ├── validations.ts            # Zod schemas
│   └── __tests__/<name>.test.ts
│
├── infrastructure/               # EXTERNAL — the only layer touching the DB/3rd parties
│   ├── database/
│   │   ├── drizzle/schema.ts
│   │   └── repositories/drizzle-<name>.repository.ts
│   ├── services/                 # e.g. password hasher, session store adapters
│   └── seeder.ts
│
└── presentation/                 # DELIVERY — thin bridge to the UI
    ├── http/actions/<name>.actions.ts   # Server Actions, the composition root
    └── ui/
        ├── pages/
        ├── components/
        └── hooks/
```

### Architecture guardrails (non-negotiable — see [`AGENTS.md`](../AGENTS.md) for the full list with rationale)

1. **Zero business logic in `src/app/`** — pages call Server Actions only, never a repository or handler directly.
2. **Inward dependency rule** — `Presentation → Application → Domain`. `domain/` imports nothing external.
3. **No empty/mocked sub-folders** — if a module doesn't need `domain/value-objects/`, don't create it; don't leave it as a stub either.
4. **Domain exceptions, never generic `Error`** — Server Actions catch `DomainException` specifically and mask everything else as `"Internal Server Error"`.
5. **Every mutation checks `can()`** and requires `user` on its command (see AGENTS.md §7 for why optional `user` was a real vulnerability).
6. **Side effects go through domain events**, never called directly from a handler or action — dispatch, let a listener in `application/services/` react.

### Active modules

| Module | Responsibility |
|---|---|
| `products` | Product catalog: create, edit, price validation, delete |
| `users` | User profiles + admin user management (name, email, role) |
| `notifications` | Two-layer notification system — see §4 below |
| `audit-logs` | Async recording of sensitive actor activity |
| `auth` | Authentication, registration, Edge-safe middleware, RBAC policies, impersonation |
| `setting` | Global app/business configuration (API credentials, business profile, timezone) |
| `dashboard` | Read-model summary metrics for the operations overview page |

---

## 2. Auth Architecture (NextAuth v5 / Auth.js)

- **Edge-compatible config** (`src/shared/config/auth.ts`): the subset of config safe to import from `middleware.ts` (Edge runtime) — OAuth provider config, page redirects. No Node-only APIs.
- **Full server lib** (`src/shared/lib/auth.ts`): the complete NextAuth initialization — `DrizzleAdapter`, the `Credentials` provider, bcrypt password verification. Free to do DB queries and heavy crypto since it never runs on the Edge.
- **Generic OAuth toggle**: `NEXT_PUBLIC_ENABLE_OAUTH="true"` shows the OAuth button(s) on `/login` and registers the provider in NextAuth; `"false"` hides it entirely, leaving a clean credentials-only form.

---

## 3. Modular Database Seeding

`scripts/seed.ts` is the central runner. It refuses to run when `NODE_ENV === "production"` (a real safety gap this had until it was fixed — seeding known-password admin accounts into a live database was previously possible by accident).

Each module owns its own seed data:
```typescript
// src/modules/<name>/infrastructure/seeder.ts
import { NodePgDatabase } from "drizzle-orm/node-postgres";
export async function seed(db: NodePgDatabase) {
  // insert demo rows via db.insert(...)
}
```
The runner scans `src/modules/` at runtime, dynamically imports every `seeder.ts` that exports a `seed` function, and executes them in sequence — no manual registration step.

```bash
bun run db:seed                    # all modules
bun run db:seed --module users     # one module only
```

---

## 4. Notification System

Two independent configuration layers:

1. **Global (system) config** — the `settings` table controls whether email/push/whatsapp channels are enabled at all, and stores gateway credentials (SMTP, Fonnte).
2. **Per-user preferences** — the `user_notification_settings` table lets each user opt in/out of email, push, or WhatsApp individually.

`SendNotificationHandler` only dispatches through a channel if it's enabled **both** globally **and** by the individual user's preference — either layer can veto a channel.

In development, if no email/WhatsApp gateway is configured, the corresponding listener logs a clear skip message (`[EmailListener] Email gateway not configured. Skipping...`) instead of silently failing — check the terminal, not just the UI, if a notification-dependent feature seems to do nothing.

---

## 5. Superadmin Impersonation ("Login As")

1. **Policy-gated**: the `"impersonate"` permission is granted only to `super_admin` in `src/modules/auth/domain/policies.ts`.
2. **Session exchange**: `src/shared/lib/auth.ts` reads the `impersonate_target` cookie to temporarily swap the active session's identity.
3. **Original identity preserved**: the real super_admin's id/role are kept in `originalUserId`/`originalUserRole` on the session, so `POST /api/auth/stop-impersonation` can restore it instantly.
4. **Audited**: every impersonation start/stop is recorded via `auth-audit.listener.ts`.
5. **CSRF-protected**: both the start and stop endpoints verify a CSRF token — if you add a new state-changing auth endpoint, follow this pattern, don't skip it on one sibling endpoint (this was a real, fixed gap).

---

## 6. Testing

**Unit & validation tests** live at `src/modules/<name>/application/__tests__/<name>.test.ts`, run by `bun test` directly (fast, no browser). **E2E tests** live under `tests/e2e/*.e2e.ts`, run by Playwright.

```bash
bun run test --module products     # unit + e2e for one module
bun run test:unit                  # all unit tests, no browser
bun run test:e2e --module products --headed   # watch Playwright drive a real browser
npx playwright show-report tests/playwright-report   # inspect a completed E2E run
```

Conventions actually followed in this codebase:
- E2E tests avoid depending on static seed data — each test creates, edits, and deletes its own data within the same run (database hygiene).
- `generateUniqueString(prefix)` (`src/shared/lib/utils.ts`) avoids collisions when tests run in parallel.
- Locators are scoped per-row (`page.locator("tr").filter({ hasText: name })`) plus a dynamic `data-testid` (`edit-button-${id}`) to avoid Playwright strict-mode ambiguity — see AGENTS.md §8 for the full `data-testid` convention every new interactive element should follow.

---

## 7. Deployment Checklist

- [ ] Set every required env var on your platform (Vercel/Railway/etc.) — `src/shared/config/env.ts` is the authoritative list; an empty required value fails the build loudly rather than crashing at runtime
- [ ] Point `DATABASE_URL` at your production database
- [ ] Generate a fresh `AUTH_SECRET`: `bunx auth secret`
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Run migrations against production: `bun run db:migrate` (never `db:push` against prod — `push` can silently drop columns)
- [ ] Do **not** run `db:seed` against production — the runner refuses if `NODE_ENV=production`, but don't rely on that as your only safeguard
- [ ] Test the full auth flow (login, logout, and OAuth if enabled) end-to-end against the deployed URL
- [ ] Confirm HTTPS is enforced (automatic on Vercel/Railway)

## 8. Suggested Additions (not built-in, add if your product needs them)

| Need | Library |
|---|---|
| Transactional email | Resend + React Email |
| File upload | Uploadthing |
| Background jobs | Trigger.dev |
| Payment processing | Midtrans (Indonesia-local) / Stripe |
| Product analytics | PostHog |
| Error tracking | Sentry |
| Realtime | Pusher / Ably |
