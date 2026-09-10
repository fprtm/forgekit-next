# Phase 2a — Ticket Index

**Scope**: 22 audit findings (6 critical, 16 high) + anemic domain (promoted from medium)
**Tickets**: 13
**Execution**: dependency-ordered frontier — start with unblocked tickets, advance as dependencies clear

## Dependency Graph

```
T-001 RBAC Redesign ─────────────────┐
                                      ├──▶ T-003 Security Batch
T-002 Auth Command Types ────┬───────┤
                              │       ├──▶ T-005 Setting Rebuild
                              │       │
                              ├───────┼──▶ T-007 Listener DI
                              │       │
                              ├───────┼──▶ T-004 Users Module ──▶ T-006 App Router
                              │       │
                              └───────┼──▶ T-010 Entity Refactor ──▶ T-011 Dead Code
                                      │
T-009 DB Schema ──────────────────────┘ (independent)
T-005 Setting + T-007 Listener ──▶ T-008 Events Wiring
T-010 Entity ──▶ T-012 Dashboard
T-012 Dashboard + T-013 Type Safety (independent after T-010)
T-008 Events ──▶ T-013 Type Safety (EventDispatcher)
```

## Frontier (starting set — no dependencies)

| Ticket | Title | Findings |
|--------|-------|----------|
| T-001 | RBAC Redesign | #1 |
| T-002 | Auth Command Types | #3 |
| T-009 | Database Schema | #18, #19 |

## Full Ticket List

| # | Title | Findings | Depends | Est |
|---|-------|----------|---------|-----|
| T-001 | RBAC Redesign — glob + hierarchy | #1 | — | M |
| T-002 | Auth Command Types — user required | #3 | — | M |
| T-003 | Security Hardening Batch | #2,#4,#5,#6,#15,#16,#17 | T-001 | L |
| T-004 | Users Module — IUserRepo + handlers | #8 | T-002 | M |
| T-005 | Setting Module Full Rebuild | #9,#23,#24(setting) | T-001, T-002 | L |
| T-006 | App Router → Server Actions | #7,#32 | T-002, T-004 | M |
| T-007 | Listener DI + Composition Roots | #10,#11,#12 | T-002 | M |
| T-008 | Domain Events Wiring | #14,#29 | T-005, T-007 | M |
| T-009 | Database Schema — constraints + indexes | #18,#19 | — | S |
| T-010 | Entity Class Refactor | #31 | T-002, T-004, T-005 | XL |
| T-011 | Dead Code Purge (2a portion) | #13 | T-008, T-010 | S |
| T-012 | Dashboard — domain layer + remove fakes | #20,#33 | T-010 | M |
| T-013 | Type Safety — EventDispatcher + forms | #22 | T-008 | S |

Est: S = <1hr, M = 1-3hr, L = 3-6hr, XL = 6+hr

## How to Review This Feature

1. **SDS** (~5 min) — technical approach for all 10 design areas. Start here.
2. **Tickets** (this directory) — in dependency order. Each ticket has its own DoD checklist.
3. **Audit report** (`reports/2026-09-09-full-codebase-audit.md`) — reference for finding details, only if reviewing specific findings mentioned in tickets.
