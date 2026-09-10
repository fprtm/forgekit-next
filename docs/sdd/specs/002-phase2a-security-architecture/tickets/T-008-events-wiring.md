# T-008: Domain Events Wiring

**Findings**: #14 (high — 4 dead events), #29 (medium — missing dispatches)
**Depends on**: T-005 (setting handlers rebuilt), T-007 (listeners DI'd)
**Blocks**: T-013 (type safety — EventDispatcher)

## Scope

### Dead Events → Wire or Delete
| Event | Action | Where |
|-------|--------|-------|
| `UserLoggedInEvent` | Wire | Dispatch from `auth.config.ts` signIn callback |
| `UserLoggedOutEvent` | Wire | Dispatch from logout Server Action |
| `SettingUpdatedEvent` | Wire | Already handled in T-005 |
| `AuditLogCreatedEvent` | Delete | Audit creation IS the side effect — no need for meta-event |

### Missing Dispatches
Add `eventDispatcher.dispatch()` to:
- `MarkAllNotificationsReadHandler`
- `UpdateUserSettingHandler` (notifications)
- `LogActionHandler` (audit-logs) — dispatch after successful log write

### Orphan Events
- `UserPasswordResetEvent` — dispatched but no listener. Create `PasswordResetNotificationListener` that sends email notification.

### EventDispatcher Fix
- Log rejected promises from `Promise.allSettled()` (currently silently swallowed)
- Add `await` to dispatch calls in `ImpersonateUserHandler` (currently fire-and-forget)

## DoD

- [ ] `UserLoggedInEvent` dispatched on successful login
- [ ] `UserLoggedOutEvent` dispatched on logout
- [ ] `AuditLogCreatedEvent` class + listener deleted
- [ ] All 3 mutation handlers dispatch events
- [ ] `UserPasswordResetEvent` has a listener
- [ ] `EventDispatcher.dispatch()` logs rejected promise reasons via `logger.warn`
- [ ] No fire-and-forget dispatch (all dispatch calls awaited)
- [ ] `bun run typecheck` passes
- [ ] `bun run test` passes (existing event tests)
