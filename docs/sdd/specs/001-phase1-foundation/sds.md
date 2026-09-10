# SDS — Phase 1: Foundation (Design System & Route Hygiene)

Refs: ADR-001 (`docs/sdd/decisions/001-design-system-restructure-phasing.md`)

## Scope

Two independent, low-risk changes that don't touch business logic, database, or auth:

1. Centralize the `/d` dashboard route prefix into a single source of truth.
2. Write down the component boundary contract that already exists in practice but isn't documented anywhere — see `docs/sdd/design-system/design.md`.

## 1. Route centralization

### Decision

Keep the `/d` prefix (short, intentional for the authenticated area). Do not rename it. Fix the fragility instead: today the string `"/d"` (and its children, e.g. `"/d/users/accounts"`) is hardcoded in 15+ files — `menu.ts`, page redirects, `<Link href>`, e2e tests. A future prefix change means grep-and-replace across the whole codebase with no compiler safety net.

### Shape

New file: `src/shared/config/routes.ts` — a nested const object, not functions-only, so both static and dynamic segments read naturally:

```typescript
export const routes = {
  dashboard: {
    root: "/d",
    products: {
      list: "/d/products",
      create: "/d/products/create",
      detail: (id: string) => `/d/products/${id}`,
    },
    users: {
      root: "/d/users",
      accounts: "/d/users/accounts",
      admins: "/d/users/admins",
      users: "/d/users/users",
      create: "/d/users/create",
      edit: (id: string) => `/d/users/${id}/edit`,
    },
    settings: {
      root: "/d/settings",
      notifications: "/d/settings/notifications",
    },
    profile: "/d/profile",
  },
  auth: {
    login: "/login",
  },
} as const;
```

- Static paths → plain string constants.
- Dynamic paths (`[id]`) → functions taking the param, so callers can't typo a template string.
- One flat-ish nested object mirroring the `app/d/` folder tree — no need for a class or builder pattern here, this is data, not logic.

### Migration

Every hardcoded `"/d..."` string found in this session's grep (`menu.ts`, `app-sidebar/footer.tsx`, page redirects under `app/d/users/`, module UI files under `modules/users/presentation/ui/`, `modules/products/presentation/ui/components/table/`, and the notifications e2e spec) gets replaced with a `routes.*` reference. No behavior change — same URLs, same redirects, just one source of truth.

### Out of scope

Renaming the prefix itself (`/d` → `/dashboard`) — explicitly rejected by the maintainer for this phase; the URL stays as-is.

## 2. Component boundary contract

### Decision

No physical file moves. `src/shared/components/{ui,data-table,layout}/` already reflects the right boundary — the previous "split into ui/patterns/tokens" proposal was withdrawn once it was clear `data-table/` is already a validated shared pattern (used by both `products` and `users` modules) sitting in the right place, and `ui/` already contains nothing but untouched shadcn primitives. Reorganizing correctly-placed files would be churn with no functional benefit.

What was actually missing was a **written contract** — so the next person (fork/clone/AI agent) knows where a new shared component goes without guessing. That contract is written to `docs/sdd/design-system/design.md` (see that file for the full rule).

### Token layer

No new file. `src/app/globals.css`'s `@theme` block (Tailwind v4 convention) is already the single source of truth for color/radius/spacing tokens. `design.md` documents *how to read* this file and the rule for extending it — it does not duplicate its values into a second format.

## Non-goals for Phase 1

- No `patterns/` umbrella folder (nothing to put there yet — `data-table/` earned its shared spot through actual reuse; a folder for hypothetical future patterns would be premature).
- No generic `form-shell` extraction from `use-product-form` / `use-user-form` (only 2 instances, schemas differ — below the rule-of-three bar for abstraction).
- No Storybook, no generator script — deferred to Phase 3/4 per ADR-001.
