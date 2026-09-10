# T-010: Entity Class Refactor (Anemic → Rich Domain)

**Findings**: #31 (medium, promoted to 2a — anemic domain model)
**Depends on**: T-002 (command types), T-004 (users module), T-005 (setting module)
**Blocks**: T-011 (dead code — value objects may now be used), T-012 (dashboard entities)

## Scope

Convert all domain entities from plain TypeScript interfaces to classes with:
- Private constructor
- `static create(props)` — validates via value objects, throws DomainException if invalid
- `static reconstruct(raw)` — no validation, for loading from DB
- Behavioral methods where applicable
- Read-only properties via getters

### Entities to Refactor

1. **ProductEntity**
   - Use `PriceValueObject` in `create()` (currently unused)
   - Add `updatePrice(n)`, `updateName(n)` methods
   - Factory validates: name not empty, price valid

2. **UserEntity**
   - Use `EmailValueObject` in `create()` (currently unused)
   - Add `changeRole(role)`, `deactivate()` methods
   - Factory validates: email format, role valid

3. **Setting**
   - Fix `SettingKeyValueObject` regex: change UPPERCASE validation to lowercase (actual keys are lowercase)
   - Use in `create()` for key validation

4. **NotificationEntity**
   - Basic class conversion
   - Add `markAsRead()` method (returns new instance with `read: true`)

5. **AuditLogEntity**
   - Fix `AuditActionValueObject` format to match actual `AuditLogAction` type
   - Basic class conversion (audit logs are append-only, minimal behavior)

### Repository Changes
- Each `Drizzle*Repository` calls `Entity.reconstruct()` when mapping query results
- Remove `as unknown as Entity` casts in `DrizzleUserRepository` (Finding #30 partial fix)
- Handlers call `Entity.create()` for new entities, work with entity methods for mutations

### Handler Changes
- `CreateProductHandler`: `ProductEntity.create(command)` instead of spreading raw data
- `UpdateProductHandler`: `product.updatePrice(...)` instead of raw field updates
- Same pattern for users, settings

## DoD

- [ ] All 5 entities are classes with private constructors
- [ ] Each has `static create()` with validation and `static reconstruct()` without
- [ ] `PriceValueObject`, `EmailValueObject`, `SettingKeyValueObject`, `AuditActionValueObject` are used in `create()` methods
- [ ] `SettingKeyValueObject` regex fixed (accepts lowercase keys)
- [ ] `AuditActionValueObject` format matches `AuditLogAction` type
- [ ] Repositories use `Entity.reconstruct()` — zero `as unknown as` casts
- [ ] Handlers use `Entity.create()` for new entities
- [ ] `bun run typecheck` passes
- [ ] `bun run test` passes — existing tests updated for class API
- [ ] New unit tests for entity validation (create with invalid data throws DomainException)
