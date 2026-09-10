# T-012: Dashboard — Domain Layer + Remove Fake Stats

**Findings**: #20 (high — missing domain layer), #33 (medium — fabricated metrics)
**Depends on**: T-010 (entity pattern established)
**Blocks**: —

## Scope

### Create Domain Layer
```
src/modules/dashboard/domain/
├── repositories/
│   └── stat-reader.interface.ts    ← IStatReader (moved from handler)
└── entities/
    └── dashboard-stats.ts          ← DashboardStats type (moved from handler)
```

### Remove Fake Metrics from overview.tsx
Delete:
- Revenue calculation (`totalProductsCount * 1250 + 24500`)
- Operations count formula
- Hardcoded latency/uptime strings
- Fake weekly bar chart from hardcoded weights
- Static "System Health" panel

### Keep Real Data
- Product count (from actual DB query)
- User count (from actual DB query)
- Recent audit logs (if available)
- Display only what comes from `GetDashboardStatsHandler`

### Update Handler
- `get-dashboard-stats.handler.ts`: remove `IStatReader` inline definition → import from `domain/repositories/`
- Accept `IStatReader` via constructor (already does, but type was inline)

## DoD

- [ ] `src/modules/dashboard/domain/` exists with repositories/ and entities/
- [ ] `IStatReader` interface in `domain/repositories/`
- [ ] `DashboardStats` type in `domain/entities/`
- [ ] Handler imports from domain layer
- [ ] Zero fabricated metrics in `overview.tsx`
- [ ] Dashboard shows only real data (product count, user count)
- [ ] `bun run typecheck` passes
- [ ] Dashboard page renders without errors (manual check)
