# T-005: Setting Module Full Rebuild

**Findings**: #9 (high — bypass Application layer), #23 (medium — dead UpdateSettingHandler), #24 (medium — generic Error)
**Depends on**: T-001 (RBAC for can() checks), T-002 (AuthenticatedCommand)
**Blocks**: T-008 (event wiring)

## Scope

### New Handlers
1. `GetAllSettingsHandler` — query `settingRepo.findAll()`, requires `can(user, 'settings:read')`
2. `GetSettingsByCategoryHandler` — query `settingRepo.findByCategory(cat)`, requires read permission
3. `DeleteSettingHandler` — `settingRepo.delete(id)`, requires `can(user, 'settings:write')`, dispatch `SettingDeletedEvent`

### Fix Existing
4. `UpdateSettingHandler`:
   - Remove hardcoded `if (user.role !== 'super_admin')` check → use `can(user, 'settings:write')`
   - Replace `throw new Error(...)` with `throw new SettingUpdateForbiddenException()`
   - Add `eventDispatcher.dispatch(new SettingUpdatedEvent(...))`

### Rewire Actions
5. `setting.actions.ts`:
   - `getSettingsAction` → calls `GetAllSettingsHandler`
   - `getSettingsByCategoryAction` → calls `GetSettingsByCategoryHandler`
   - `updateSettingAction` → calls `UpdateSettingHandler.execute()` (was instantiated but never called)
   - `deleteSettingAction` → calls `DeleteSettingHandler`
   - All actions: auth() + can() checks + DomainException catch pattern

### Create Events
6. `SettingDeletedEvent` (new)
7. Wire `SettingUpdatedEvent` (exists but was never dispatched — now dispatched from handler)

## DoD

- [ ] 3 new handlers created with proper DI (constructor receives `ISettingRepository`)
- [ ] `UpdateSettingHandler` uses `can()` instead of hardcoded role check
- [ ] `UpdateSettingHandler` throws `SettingUpdateForbiddenException` instead of generic Error
- [ ] All 4+ setting actions route through handlers (zero direct repo calls in actions file)
- [ ] `SettingUpdatedEvent` dispatched on update
- [ ] `SettingDeletedEvent` dispatched on delete
- [ ] All actions have auth() + can() checks
- [ ] Dead `updateSettingUC` instantiation-without-call pattern eliminated
- [ ] `grep -rn "settingRepo\." src/modules/setting/presentation/` returns zero results (actions don't touch repo directly)
- [ ] `bun run typecheck` + `bun run lint` passes
