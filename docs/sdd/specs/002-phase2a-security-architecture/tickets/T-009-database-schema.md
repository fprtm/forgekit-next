# T-009: Database Schema — Constraints + Indexes

**Findings**: #18 (high — missing PK/FK/unique), #19 (high — zero indexes)
**Depends on**: — (independent, can start immediately)
**Blocks**: —

## Scope

### Constraints
1. `accounts` — add composite PK on `(provider, providerAccountId)`
2. `user_profiles` — add unique constraint on `userId`
3. `notifications` — add FK on `userId` referencing `users(id)` with `onDelete: 'cascade'`
4. `audit_logs` — add FK on `actorId` referencing `users(id)` with `onDelete: 'set null'`
5. `verification_tokens` — add unique on `(identifier, token)`

### Indexes
6. `notifications` — composite index on `(userId, read, createdAt)`
7. `audit_logs` — index on `(actorId, createdAt)`, index on `(entityName, entityId)`
8. `user_profiles` — index on `userId`

### Pre-check
Before applying: query existing data for constraint violations:
```sql
-- Check for duplicate user_profiles per user
SELECT user_id, COUNT(*) FROM user_profiles GROUP BY user_id HAVING COUNT(*) > 1;
-- Check for orphaned notifications
SELECT id FROM notifications WHERE user_id NOT IN (SELECT id FROM users);
```
Fix any violations before migration.

### Migration
- `bun run drizzle-kit generate` → review SQL
- `bun run drizzle-kit push` or apply migration file
- Verify with `bun run drizzle-kit check`

## DoD

- [ ] Composite PK on accounts
- [ ] Unique constraint on user_profiles(userId)
- [ ] FK on notifications.userId with cascade delete
- [ ] FK on audit_logs.actorId with set null on delete
- [ ] Unique on verification_tokens(identifier, token)
- [ ] 4 indexes created (notifications, audit_logs ×2, user_profiles)
- [ ] Pre-migration data check shows no constraint violations
- [ ] Migration applied successfully
- [ ] `bun run typecheck` passes
- [ ] Application starts and CRUD operations work post-migration
