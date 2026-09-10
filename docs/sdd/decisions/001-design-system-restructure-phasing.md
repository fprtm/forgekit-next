---
status: settled
date: 2026-09-09
---

# ADR-001: Boilerplate restructure — scope and phasing

## Context

ForgeKit's current folder structure (DDD 4-layer per module) is architecturally sound but not yet self-explanatory for third parties who will clone/fork it without access to the maintainer. The goal stated by the maintainer: an "enterprise/commercial-grade" design system and module structure, clear enough that forking it produces a robust starting point immediately — components (tables, inputs, etc.) already in place, module boundaries obvious.

## Decision

Restructure is accepted as **Opsi B (deeper restructuring)**, but executed as **4 sequential phases** rather than one large effort, because the full ambition (enterprise design system + generator + full module migration) is multi-session scope and the original DoD proposal (a single `adding-a-module.md` doc) undershot the stated ambition.

1. **Phase 1 — Foundation**: centralize `/d` route prefix into `src/shared/config/routes.ts`, document component boundary contract in `design.md`. No physical file moves (original split proposal was withdrawn after code inspection — existing structure is already correct). See `specs/001-phase1-foundation/sds.md`.
2. **Phase 2a — Security, Architecture & Domain Model**: fix all 22 critical+high audit findings (RBAC, IDOR, auth bypass, dependency rule violations, dead events, DB constraints) + entity class refactor. 13 tickets. See `specs/002-phase2a-security-architecture/`.
2b. **Phase 2b — Cleanup & Polish**: remaining 30 medium+low findings (dead code purge, naming conventions, dark mode, env validation, settings UI, test coverage, accessibility). Spec TBD.
3. **Phase 3 — Tooling**: build a `bun run make:module` generator, validated by scaffolding a real new module from it.
4. **Phase 4 — Public-facing**: minimal Storybook/visual component catalog, finalized `docs/adding-a-module.md`, README positioning for external forkers.

Each phase ships independently and the project can stop after any phase without leaving things broken.

## Why (rule-of-three: hard to reverse, surprising, real trade-off)

- Hard to reverse: folder/module conventions, once forked by third parties, are expensive to change later without breaking downstream forks.
- Surprising: maintainer's initial DoD ("just one doc") was smaller than the stated ambition ("enterprise/commercial-grade, ready for anyone to fork or sell") — this gap was surfaced and resolved by phasing instead of silently picking one.
- Real trade-off: doing everything in one pass risks scope creep and an unfinished mega-change; phasing trades a slower full rollout for continuous shippable value and lower risk per step.

## Alternatives considered

- **Opsi A (docs + minor split only)**: rejected — undersized relative to the "enterprise/commercial, fork/sell-ready" goal.
- **Single large effort (no phasing)**: rejected — cost estimate ~4-6 sessions in one shot, too large a blast radius for a solo-maintained repo with no rollback safety net beyond git.

## Consequence

Next step: `/sdd-pipeline:spec` runs for Phase 1 only. Phases 2-4 are tracked as future work, not committed to yet.
