# T-013: Type Safety — EventDispatcher + Forms

**Findings**: #22 (high — EventDispatcher any[], form as any)
**Depends on**: T-008 (EventDispatcher changes)
**Blocks**: —

## Scope

### EventDispatcher
- `src/shared/application/services/event-dispatcher.service.ts`
- Replace `EventHandler<any>[]` with `EventHandler<DomainEvent>[]`
- Remove the `eslint-disable` comment
- Ensure type safety: handlers registered for specific event types

### Users Form
- `src/modules/users/presentation/ui/components/form/index.tsx:31-32`
- Remove `as any` casts
- Derive form types from Zod schema: `type UserFormValues = z.infer<typeof userSchema>`
- Fix the root cause: `useForm<UserFormValues>()` with proper type parameter so `{...form}` matches `<Form>` component props

### Products Form (related)
- Check `src/modules/products/presentation/ui/hooks/use-product-form.ts`
- If `zodResolver` uses `as unknown as Resolver`, fix same way

## DoD

- [ ] Zero `any` in `event-dispatcher.service.ts`
- [ ] Zero `as any` in `users/form/index.tsx`
- [ ] Form types derived from Zod schema
- [ ] `zodResolver` calls without `as unknown` casts
- [ ] `grep -rn "as any" src/modules/users/presentation/` returns zero results
- [ ] `grep -rn ": any" src/shared/application/services/event-dispatcher` returns zero results
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
