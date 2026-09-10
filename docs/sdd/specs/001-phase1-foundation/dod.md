# DoD — Phase 1: Foundation

Refs: `sds.md`, ADR-001

- [ ] `src/shared/config/routes.ts` created with the shape in `sds.md` §1
- [ ] Every hardcoded `"/d..."` string replaced with a `routes.*` reference — grep for `"/d` and `'/d` across `src/` and `middleware.ts` returns zero matches outside `routes.ts` itself
- [ ] No behavioral change: every URL and redirect target is byte-identical to before the refactor
- [ ] `docs/sdd/design-system/design.md` exists and is linked from `docs/sdd/index.md`
- [ ] `docs/forgekit-guide.md` §4 (folder structure) matches the actual `src/` tree — no stale `(dashboard)` route-group example, no missing `shared/components/data-table` mention
- [ ] Zero file moves under `src/shared/components/` (Phase 1 is docs + routes only, per settled scope)
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] Existing Playwright e2e suite passes unchanged (notifications spec references `/d` paths — must still resolve correctly through `routes.ts`)

## Test plan

No new business logic, so no new unit tests. Verification is:
1. Static: typecheck + lint clean.
2. Regression: existing e2e suite green (proves the route refactor didn't change any actual URL).
3. Manual grep sweep for stray `"/d"` literals as a mechanical completeness check.
