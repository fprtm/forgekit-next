# T-004: Users Module — IUserRepo Extension + Handler Fix

**Findings**: #8 (high — handlers bypass IUserRepository)
**Depends on**: T-002 (commands need required user)
**Blocks**: T-006 (app router fix for user pages)

## Scope

1. Extend `IUserRepository` interface:
   ```typescript
   findProfileByUserId(userId: string): Promise<UserProfile | null>;
   upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
   ```
2. Implement in `DrizzleUserRepository` — move the Drizzle queries from handlers here
3. Refactor `get-user-profile.handler.ts`:
   - Remove `import { db } from "@/db"`, `import { eq } from "drizzle-orm"`, `import { userProfiles }`
   - Inject `IUserRepository` via constructor
   - Call `this.userRepo.findProfileByUserId(userId)`
4. Refactor `update-profile.handler.ts`:
   - Same cleanup — remove all Drizzle imports
   - Use `this.userRepo.upsertProfile(userId, data)`
   - Wrap multi-step operation in transaction (via repo method)

## DoD

- [ ] `IUserRepository` has `findProfileByUserId` and `upsertProfile` methods
- [ ] `DrizzleUserRepository` implements both
- [ ] `get-user-profile.handler.ts` has zero imports from `@/db` or `drizzle-orm`
- [ ] `update-profile.handler.ts` has zero imports from `@/db` or `drizzle-orm`
- [ ] Both handlers receive `IUserRepository` via constructor
- [ ] `grep -rn "from \"@/db\"" src/modules/users/application/` returns zero results
- [ ] Existing user tests pass
- [ ] `bun run typecheck` passes
