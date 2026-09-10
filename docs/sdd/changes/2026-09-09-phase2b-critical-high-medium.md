# Change Record — Phase 2b Batch 1 (Critical + High + Medium)

Refs: `docs/sdd/reports/2026-09-09-consolidated-audit.md`

## Scope

All Critical (1), High (6), and Medium (16) findings from the consolidated audit — **except** two items explicitly deferred to the scheduled design-system conversation, since they're design-taste decisions, not bugs:
- Finding #13 (three incompatible page-header patterns) — deferred
- Finding #15 (spacing-scale outliers) — deferred

## Decisions (settled via AskUserQuestion before this build)

- **Forgot password**: full end-to-end flow (request → token → reset page → confirm) built for real, not stubbed. In dev, the reset token is delivered via the existing notification/event pattern (console-visible) instead of a real email provider — swappable later since notifications are already event-driven.
- **Registration**: build a real `/register` UI page on top of the existing `RegisterUserHandler` backend.
- **`bun audit fix`**: run directly, verify app still boots and tests pass after.

## Batches (parallel, file-disjoint by module)

1. `bun audit fix` — done directly, not delegated.
2. Auth password flows — self-service change-password, forgot-password flow, login password-visibility toggle, password policy alignment (6→8 char min).
3. Registration UI (`/register` page).
4. Quick config fixes — Settings sidebar nav link, CSP header, seeder `NODE_ENV` guard.
5. Test coverage scaffolding — setting/audit-logs/dashboard modules (critical paths, not 100% coverage).
6. Card adoption + dark-mode fix — 9 files in users/products, plus AlertDialog for the 2 native `confirm()` delete actions there.
7. Setting module unification — react-hook-form + Zod across all 4 tab forms, shared `Select`, `Button variant="destructive"`, AlertDialog for the 4 reset-to-defaults confirms, password-visibility toggle on Integration tab's secret fields.
8. Dead code cleanup — unused controllers, exceptions, constant files, duplicate `UserRole`.
9. Naming consistency — `INotificationRepository` rename, `save()`→`create()`, `findAll()`→`findMany()`.
10. Env var validation — route `LOG_LEVEL`, `NEXT_PUBLIC_APP_URL`, `UPSTASH_REDIS_REST_URL` through the validated `env.ts` schema.
11. API route Zod validation on handlers currently accepting raw bodies.
12. Transaction wrapping for remaining multi-step mutations beyond the one already done in Phase 2a.

## DoD

- [ ] `bun audit` shows 0 critical/high in direct dependencies
- [ ] Settings reachable from primary sidebar nav (not just avatar dropdown)
- [ ] User can change their own password with old-password verification
- [ ] "Forgot password?" link leads to a working request→reset flow
- [ ] `/register` page exists and creates a real user via `RegisterUserHandler`
- [ ] CSP header present in `next.config.ts`
- [ ] Seeders refuse to run when `NODE_ENV === "production"`
- [ ] setting/audit-logs/dashboard have unit tests for their critical-path handlers
- [ ] Zero `bg-white` without `dark:` counterpart in users/products
- [ ] Zero native `confirm()` for destructive actions — all use AlertDialog
- [ ] Setting's 4 forms use `useForm` + `zodResolver`, shared `Select`, and `Button variant="destructive"`
- [ ] `bun run typecheck` / `bun run lint` / `bun run test:unit` all clean
- [ ] Live browser re-verification of the fixed flows (not just green build)

## Test plan

Static (typecheck/lint/test) + live browser click-through of every new/changed flow (password change, forgot password, registration, settings nav, delete confirmations) — same standard applied to Phase 2a, since that phase's own build revealed 3 runtime-only bugs invisible to static checks.
