# SDD Index — forgekit-next

| Doc | One-line hook |
|---|---|
| [config.md](config.md) | Mode/domain/SDLC, project intent (public boilerplate, fork/resell target) |
| [decisions/001-design-system-restructure-phasing.md](decisions/001-design-system-restructure-phasing.md) | Restructure accepted as Opsi B, split into 4 phases (foundation → proof → tooling → public-facing) |
| [design-system/design.md](design-system/design.md) | Entry doc: token SSOT, component boundary contract (ui/ vs proven shared patterns vs module-local) |
| [specs/001-phase1-foundation/sds.md](specs/001-phase1-foundation/sds.md) | Phase 1 spec: `/d` route centralization into `routes.ts` + component boundary contract, no physical file moves |
| [specs/001-phase1-foundation/dod.md](specs/001-phase1-foundation/dod.md) | Phase 1 Definition of Done + test plan |
| [decisions/002-phase2-includes-ddd-boundary-fixes.md](decisions/002-phase2-includes-ddd-boundary-fixes.md) | Audit: 9 actionable findings (Dependency Rule breaks, dead code, live authz gap in `setting` module, `any` usage, inconsistent logging) — folded into Phase 2 |

| [specs/002-phase2a-security-architecture/sds.md](specs/002-phase2a-security-architecture/sds.md) | Phase 2a spec: RBAC redesign (glob+hierarchy), auth command types, security batch, setting rebuild, entity refactor, DB constraints |
| [specs/002-phase2a-security-architecture/dod.md](specs/002-phase2a-security-architecture/dod.md) | Phase 2a DoD + test plan |
| [specs/002-phase2a-security-architecture/tickets/](specs/002-phase2a-security-architecture/tickets/) | 13 tickets with dependency graph — frontier: T-001, T-002, T-009 |
| [reports/2026-09-09-consolidated-audit.md](reports/2026-09-09-consolidated-audit.md) | **Single source of truth for outstanding work.** Merges 3 separate audit runs (architecture, UX/functional, security+UI deep-dive) into one status-tracked list: ~35 findings already fixed (Phase 1+2a), ~45 outstanding by priority. Top of the list: `bun audit fix` (5 critical dependency vulns incl. unauthenticated RCE), Settings sidebar nav, self-service password change |

## Status

Phase 1 + Phase 2a **implemented and runtime-verified** (2026-09-09): 26 agents built all 13 Phase 2a tickets + Phase 1 routes.ts on branch `phase-1-2a-implementation`. Independently verified via live browser testing (login, CRUD, impersonate, settings save, notifications) — typecheck/lint/test all clean, 3 additional runtime-only bugs found and fixed during verification (missing `pino-pretty` dependency, FK-violating seed data, RSC serialization of entity classes across 5 modules). 101 `data-testid` attributes added across all modules for e2e testability. App renamed from placeholder "PsyCare Booking" demo branding to "ForgeKit". Not yet committed.

Three follow-up audits (UX/functional, then security+UI deep-dive) ran the same day and are now merged into the single consolidated report above — read that one, not a per-run report, to see what's left. Top unaddressed item: `bun audit fix` (5 critical dependency vulnerabilities, unpatched). Phase 2b (everything in the consolidated report marked outstanding) not yet spec'd.
