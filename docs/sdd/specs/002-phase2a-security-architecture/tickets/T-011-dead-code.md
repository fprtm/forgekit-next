# T-011: Dead Code Purge (Phase 2a Portion)

**Findings**: #13 (high — dead auth handlers)
**Depends on**: T-008 (events resolved first), T-010 (value objects may now be used)
**Blocks**: —

## Scope

Delete confirmed dead code from Phase 2a findings:

1. **Dead auth handlers** (Finding #13):
   - `src/modules/auth/application/use-cases/login/login.handler.ts` + `login.command.ts`
   - `src/modules/auth/application/use-cases/logout/logout.handler.ts` + `logout.command.ts`
   - `src/modules/auth/application/use-cases/refresh-token/refresh-token.handler.ts` + `refresh-token.command.ts`

2. **Dead event** (from T-008):
   - `AuditLogCreatedEvent` class (if not already deleted in T-008)

3. **Verify value objects are now used** (from T-010):
   - If T-010 completed: `PriceValueObject`, `EmailValueObject`, `SettingKeyValueObject`, `AuditActionValueObject` should now be imported — verify, do NOT delete
   - If any value object is still unused after T-010: delete it

Remaining dead code (controllers, constants, cache services, exceptions) deferred to Phase 2b.

## DoD

- [ ] 6 dead auth handler/command files deleted
- [ ] `AuditLogCreatedEvent` deleted (if applicable)
- [ ] `grep -rn "LoginHandler\|LogoutHandler\|RefreshTokenHandler" src/` returns zero results
- [ ] All remaining value objects verified as either used or deleted
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
