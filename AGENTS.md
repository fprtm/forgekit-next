<!-- BEGIN:nextjs-agent-rules -->
# 🏗️ ForgeKit AI Agent Directives (STRICT)

This repository enforces a strict, modular **Clean Architecture (Domain-Driven Design)** combined with **Event-Driven Architecture**. AI Agents interacting with this codebase MUST strictly adhere to the following rules. Any violation of these rules is considered a failure.

## ⚖️ 1. Core Architectural Constraints
- **Zero Business Logic in App Router**: Files inside `src/app/` MUST act strictly as a "Thin Delivery Mechanism". They only map URLs to handlers (`presentation/http/controllers` or `actions`). NEVER put database calls or business rules in `src/app/`.
- **Inward Dependency Rule**: Dependencies must only point inward: `Presentation -> Application -> Domain`. The `Domain` layer must have ZERO external dependencies (no UI, no DB, no framework imports).
- **Sub-folder Utilization**: You must use the granular structure inside modules (`domain/events`, `domain/exceptions`, `presentation/http/controllers`, etc.). **Do not leave these folders empty or mock them.**

## 🛡️ 2. Strict DevSecOps & Security
- **Domain Exceptions**: NEVER throw generic `Error` instances in Use Cases. Always throw classes extending `DomainException` (e.g., `UnauthorizedException`, `ProductNotFoundException`) located in `domain/exceptions/`. 
- **Stack Trace Protection**: Server Actions and Controllers MUST catch `DomainException` to return safe error messages to the client. Generic internal errors must be masked as `"Internal Server Error"` and logged on the server.
- **IDOR & AuthZ**: Every Server Action or Use Case modifying/deleting data MUST verify user permissions (using `can()` from policies) and check ownership.

## 📡 3. Event-Driven Side Effects
- **No Manual Side-Effects in Use Cases/Actions**: Business actions (like triggering Audit Logs, sending emails, or pushing notifications) MUST NOT be executed directly within Server Actions or the primary Use Case execution path.
- **Domain Events**: Use Cases must dispatch a `DomainEvent` (e.g., `ProductCreatedEvent`) via `eventDispatcher.dispatch()`.
- **Listeners**: Side-effects must be handled by dedicated listeners (e.g., `AuditLogListener`) in the `application/services` layer that subscribe to those Domain Events.

## 🧹 4. General Guidelines
- **Always Read Existing Patterns**: Analyze structures in modules like `products` or `users`. Never invent a new pattern if one already exists.
- **Zero Deadcode**: Ensure all changes are clean, functional, do not have warning tags, and avoid any unused code.

## 🧬 5. Domain Entities — Class, Not Interface
- **Rich domain model**: Entities (`domain/entities/*.entity.ts`) are classes with a **private constructor**, never plain interfaces/types. Reference: `src/modules/products/domain/entities/product.entity.ts`.
- **Two factories, one for each origin of data**:
  - `static create(input)` — for data originating from a user/API. Validates invariants (via a Value Object, e.g. `PriceValueObject.create()`) and throws `DomainException` on violation.
  - `static reconstruct(raw)` — for data already known valid because it came from the database. Performs **zero validation**. Never call `create()` when hydrating from a repository — that re-runs validation on data that already passed it once, and can throw on legacy rows that predate a stricter rule.
  - *Why two factories*: a single constructor can't tell "brand new, unvalidated" apart from "loaded, trusted" — conflating them either double-validates trusted data or lets invalid data skip validation.
- **`toJSON()` is mandatory on every entity class.** Next.js Server Components hand data to Client Components through React's RSC serializer, which **rejects class instances outright and does NOT call `toJSON()` automatically** (unlike `JSON.stringify`). Every entity must implement `toJSON()` returning its plain-object shape.
  - **At the Server Action boundary, call it explicitly** via the shared helper: `import { toPlain } from "@/shared/domain/serialize"`, then `return { success: true, data: toPlain(result), error: null }`. Passing a raw entity (or array of entities) straight through crashes with `"Only plain objects can be passed to Client Components..."` — this is a **runtime-only** failure invisible to `tsc`/`eslint`, so it will not be caught by `bun run typecheck`. Verify by actually clicking the feature in a browser, not just by a green build.
  - Server Components that never pass entity data into a `"use client"` component (e.g. `dashboard/presentation/ui/pages/overview.tsx`) don't need this — the RSC boundary only exists between server and client components, not within pure server rendering. But default to calling `toPlain()` at every Server Action return unless you've confirmed no client component ever consumes it.

## 🔐 6. Authorization — Permission Hierarchy, Not a Flat List
- **Model**: `src/modules/auth/domain/policies.ts` defines a linear role hierarchy (`ROLE_HIERARCHY`: `super_admin > admin > user`) and each role's **own** permissions only (`ROLE_PERMISSIONS`). `getEffectivePermissions(role)` collects a role's own permissions plus everything inherited from roles below it in the hierarchy.
  - *Why not give `super_admin` a literal `"**"` wildcard string*: an earlier version did exactly that, and `Array.includes('products:update')` on `['**']` is always `false` — a wildcard string doesn't literally match anything via `.includes()`. The bug locked `super_admin` out of every `can()` check, including `impersonate`, until it was found via full-app runtime testing (not caught by unit tests, which mocked around the exact code path that was broken). The fix: super_admin's *effective* permission set is everything below it in the hierarchy, resolved as real permission strings, not a glob that has to be matched specially.
- **`matchPermission(pattern, action)`** still supports `'**'` (matches everything) and `'namespace:*'` (matches a whole namespace) for cases where you *do* want to grant a role a broad pattern — use it, but know it's resolved through real string matching, not hierarchy inheritance.
- **Adding a new role**: add it to both `ROLE_HIERARCHY` (its position in the chain) and `ROLE_PERMISSIONS` (only the permissions it adds beyond what it inherits). Do not re-list inherited permissions — that's what the hierarchy is for, and duplicating them is exactly the kind of drift that caused the original bug.
- **Testing permissions**: `src/modules/auth/domain/__tests__/policies.test.ts` is the reference test file — it exercises hierarchy inheritance, glob matching, and the "no upward inheritance" case (a `user` must not gain `admin`-only permissions). Extend it, don't bypass it, when adding roles or permissions.

## 🧾 7. Mutation Commands — `user` Is Required, Not Optional
- Every mutation command (create/update/delete) extends `AuthenticatedCommand` (`src/shared/domain/types/authenticated-command.ts`), which makes `user: AuthUser` a **required** field, not `user?: AuthUser`.
  - *Why*: an optional `user` field lets a handler write `if (currentUser) { if (!can(...)) throw }` — which silently **skips the entire authorization check** if the caller simply omits `user`. This was a real, confirmed vulnerability across 6+ handlers. Making `user` required moves the guarantee to the type system: the composition root (Server Action / route handler) must call `auth()` and resolve a real session before it can even construct a valid command object, and the handler can call `can()` unconditionally with no defensive `if`.
- **Composition root responsibility**: Server Actions/route handlers for mutations must: call `auth()` → if no session, return an error immediately → only then construct the command with the resolved `user` and call the handler. Never pass `session?.user` (optional chaining) into a mutation command — resolve or reject before calling the handler.
- **Read-only commands stay optional** (`user?: AuthUser`) when the read behavior legitimately varies by whether a caller is authenticated (e.g. filtering results to "your own" vs "all"). Don't force every command through `AuthenticatedCommand` — only ones that gate a write.

## 🧪 8. Testability — Every Interactive Element Gets a `data-testid`
- Add `data-testid` to every form input, button, tab, dialog trigger, and nav link you create — not just the ones you think a test will need. A missing test-id turns a 1-line Playwright selector into a fragile placeholder/CSS-structure hack (this happened during this repo's own manual verification: the login form had none, forcing raw DOM manipulation to test at all).
- **Naming convention** (kebab-case, matches what's already in the codebase — grep for `data-testid` in `src/modules/*/presentation/ui/components/table/` for more examples before inventing a new shape):
  - Per-row/per-item actions: `{action}-button-${id}` — e.g. `edit-button-${product.id}`, `delete-button-${user.id}`.
  - Form fields: `{field-name}-input` / `{field-name}-select` / `{field-name}-checkbox`.
  - Submit buttons: `{action}-submit-button` — e.g. `create-product-submit-button`.
  - Forms themselves (the `<form>` element): `{entity}-form`.
  - Nav links: `nav-{route-name}-link`, sub-items `nav-{parent}-{child}-link`.
  - Tabs: `{tab-name}-tab`. Sheets/dialogs: `{name}-sheet` / `{name}-dialog`.
- `data-testid` is **additive only** — never remove or replace an existing `htmlFor`/`id`/`aria-label` to add one. Accessibility attributes and test attributes solve different problems; a component needs both.

## 🎨 9. Layout — Semantic Classes, Not Ad-Hoc Tailwind Values
- **`src/app/globals.css`'s `@layer components` block is the single source of truth for structural spacing/layout**: `.page-shell`, `.page-header`, `.page-title`, `.page-description`, `.content-stack`, `.form-stack`, `.form-field`, `.section-stack`, `.icon-sm` (size-4), `.icon-md` (size-5). Every new page/form MUST use these instead of inventing its own `text-3xl font-bold`, `space-y-8`, `h-4 w-4`, etc.
  - *Why*: every module previously hardcoded the same visual role (page title, card padding, form spacing) with a different one-off value — 3-4 incompatible header patterns existed across products/users/setting/dashboard before this was fixed. Naming the role once and reusing the class means a future visual-scale change is a one-line edit to `globals.css`, not a grep-and-replace across every module.
  - Read `globals.css` before writing any new page markup. If none of the existing classes fit and you find yourself repeating the same one-off value across 3+ files, add a new named class to that same `@layer components` block — don't scatter the raw value.
- **Rescaling the whole app**: `--spacing` in the `@theme` block at the top of the layout section is the base multiplier every `p-*`/`m-*`/`gap-*` Tailwind utility derives from (Tailwind v4). Change it once to rescale everything, rather than touching component code.

## 📚 10. Adding a New Module — Full Walkthrough
- See **[`docs/adding-a-module.md`](docs/adding-a-module.md)** for the complete, code-by-code guide to scaffolding a new module (entity, exceptions, repository, use-case, Server Action, UI, route, seeder, tests) — every step references a real file in the `products` module as the working example.
<!-- END:nextjs-agent-rules -->
