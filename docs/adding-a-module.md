# Adding a New Module

This is the step-by-step reference for adding a new feature module to ForgeKit — e.g. `invoices`, `orders`, whatever your product needs. Every step points at a real file in the `products` module (the most mature reference implementation) so you can open it side-by-side while you build.

**Read [`AGENTS.md`](../AGENTS.md) first** if you haven't — it's the short version of the rules; this doc is the long version with runnable code.

---

## 0. The shape you're building

```
src/modules/invoices/
├── domain/
│   ├── entities/invoice.entity.ts
│   ├── exceptions/invoice.exceptions.ts
│   ├── repositories/invoice-repository.interface.ts
│   ├── value-objects/          (only if a field needs its own validation rule)
│   └── events/invoice.events.ts
├── application/
│   ├── use-cases/
│   │   └── create-invoice/
│   │       ├── create-invoice.command.ts
│   │       ├── create-invoice.dto.ts
│   │       └── create-invoice.handler.ts
│   ├── validations.ts
│   └── __tests__/invoices.test.ts
├── infrastructure/
│   ├── database/
│   │   ├── drizzle/schema.ts
│   │   └── repositories/drizzle-invoice.repository.ts
│   └── seeder.ts
└── presentation/
    ├── http/actions/invoice.actions.ts
    └── ui/
        ├── pages/{list,create,edit}.tsx
        ├── components/{form,table}/
        └── hooks/use-invoice-form.ts
```

Dependencies point inward only: `presentation → application → domain`. `domain/` never imports from the other three.

---

## 1. Domain entity — a class, not an interface

Reference: `src/modules/products/domain/entities/product.entity.ts`.

```typescript
// src/modules/invoices/domain/entities/invoice.entity.ts
export interface InvoiceProps {
  id: string
  amount: number
  status: "draft" | "sent" | "paid"
  createdAt: Date
  updatedAt: Date
}

export type CreateInvoiceInput = Omit<InvoiceProps, "id" | "status" | "createdAt" | "updatedAt">

export class InvoiceEntity {
  public readonly id: string
  public readonly amount: number
  public readonly status: InvoiceProps["status"]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  private constructor(props: InvoiceProps) {
    this.id = props.id
    this.amount = props.amount
    this.status = props.status
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  /** New data, from user input — validates invariants, throws DomainException. */
  public static create(input: CreateInvoiceInput): InvoiceEntity {
    if (input.amount <= 0) {
      throw new InvalidInvoiceAmountException(input.amount)
    }
    const now = new Date()
    return new InvoiceEntity({ id: crypto.randomUUID(), amount: input.amount, status: "draft", createdAt: now, updatedAt: now })
  }

  /** Trusted data, from the database — no validation. */
  public static reconstruct(raw: InvoiceProps): InvoiceEntity {
    return new InvoiceEntity(raw)
  }

  public markAsSent(): InvoiceEntity {
    return new InvoiceEntity({ ...this, status: "sent", updatedAt: new Date() })
  }

  /** Mandatory: RSC's serializer rejects class instances and does NOT call
   * toJSON() automatically (unlike JSON.stringify) — call this explicitly
   * via `toPlain()` (src/shared/domain/serialize.ts) at every Server Action
   * return before handing data to a Client Component. */
  public toJSON(): InvoiceProps {
    return { id: this.id, amount: this.amount, status: this.status, createdAt: this.createdAt, updatedAt: this.updatedAt }
  }
}
```

**Why two factories**: `create()` is for anything originating from a user — it validates and can reject bad input. `reconstruct()` is for data already known valid because it came from your own database — it does zero validation. Calling `create()` on a DB row risks throwing on legacy data that predates a stricter rule; calling `reconstruct()` on user input skips validation entirely. Keep them separate.

Only reach for a `domain/value-objects/` file if a single field has its own validation rule reused in more than one place (see `PriceValueObject` in `products`) — don't create one pre-emptively for a single scalar field.

## 2. Domain exceptions — one grouped file per module

Reference: `src/modules/notifications/domain/exceptions/notification.exceptions.ts`.

```typescript
// src/modules/invoices/domain/exceptions/invoice.exceptions.ts
import { DomainException } from "@/shared/domain/exceptions/domain.exception"

export class InvoiceNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Invoice ${id} not found`, "INVOICE_NOT_FOUND", 404)
  }
}

export class InvalidInvoiceAmountException extends DomainException {
  constructor(amount: number) {
    super(`Invoice amount must be positive, got ${amount}`, "INVALID_INVOICE_AMOUNT", 400)
  }
}
```

Never throw a bare `Error` in application/domain code — always a `DomainException` subclass. Server Actions catch `DomainException` specifically and forward its message safely; everything else gets masked as `"Internal Server Error"` and logged server-side (see step 6).

## 3. Repository interface (port)

Reference: `src/modules/products/domain/repositories/product-repository.interface.ts`.

```typescript
// src/modules/invoices/domain/repositories/invoice-repository.interface.ts
import { InvoiceEntity } from "../entities/invoice.entity"

export interface IInvoiceRepository {
  findById(id: string): Promise<InvoiceEntity | null>
  findMany(): Promise<InvoiceEntity[]>
  create(input: { amount: number }): Promise<InvoiceEntity>
  update(id: string, data: Partial<{ amount: number; status: string }>): Promise<InvoiceEntity>
}
```

Naming convention: `findMany` (not `findAll`), `create` (not `save`), interface file named `<entity>-repository.interface.ts`.

## 4. Drizzle schema + repository implementation

Schema lives at `infrastructure/database/drizzle/schema.ts` (reference: `src/modules/products/infrastructure/database/drizzle/schema.ts`). The implementation goes in `infrastructure/database/repositories/drizzle-invoice.repository.ts` — this is the canonical path used by `products`, `users`, `setting`, `notifications`, and `audit-logs`.

```typescript
// src/modules/invoices/infrastructure/database/repositories/drizzle-invoice.repository.ts
import { IInvoiceRepository } from "../../../domain/repositories/invoice-repository.interface"
import { InvoiceEntity } from "../../../domain/entities/invoice.entity"
import { db } from "@/db"
import { invoices } from "../drizzle/schema"
import { eq } from "drizzle-orm"

export class DrizzleInvoiceRepository implements IInvoiceRepository {
  async findById(id: string) {
    const [row] = await db.select().from(invoices).where(eq(invoices.id, id))
    return row ? InvoiceEntity.reconstruct(row) : null
  }
  // ...findMany/create/update follow the same reconstruct() pattern
}
```

Remember to add indexes/constraints for anything you'll query by or that needs uniqueness — an empty schema with zero indexes is a real, easy-to-miss production issue (see the consolidated audit report for what that cost this repo once).

## 5. Use case (application layer)

Reference: `src/modules/products/application/use-cases/create-product/`.

```typescript
// create-invoice.command.ts
import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface CreateInvoiceCommand extends AuthenticatedCommand {
  amount: number
}
```

**`user` is required, not optional**, on every mutation command. An optional `user` field is how a real authorization bypass happened in this codebase once — a handler's `if (currentUser) { check permission }` guard silently skips the check entirely if the caller omits `user`. Making it required moves the guarantee into the type system: you cannot construct a valid command without a resolved session.

```typescript
// create-invoice.handler.ts
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { InvoiceCreatedEvent } from "../../../domain/events/invoice.events"

export class CreateInvoiceHandler {
  constructor(private repo: IInvoiceRepository) {}

  async execute(command: CreateInvoiceCommand): Promise<InvoiceEntity> {
    if (!can(command.user, "invoices:create")) {
      throw new UnauthorizedException()
    }
    const invoice = await this.repo.create({ amount: command.amount })
    await eventDispatcher.dispatch(new InvoiceCreatedEvent(invoice, command.user.id))
    return invoice
  }
}
```

**Never call side effects directly** (sending a notification, writing an audit log) — dispatch a domain event and let a listener in `application/services/` react to it. See `src/modules/products/application/use-cases/create-product/` for the full pattern including the DTO.

### Permissions

Add your module's permissions to `src/modules/auth/domain/policies.ts`'s `ROLE_PERMISSIONS` — only to the role that should originate them; the linear hierarchy (`super_admin > admin > user`) means higher roles inherit automatically. Do not give `super_admin` a literal `"**"` string; that was a real, critical bug (`Array.includes` doesn't match wildcards literally) — the hierarchy already grants super_admin everything below it.

## 6. Server Action (composition root)

Reference: `src/modules/products/presentation/http/actions/product.actions.ts`.

```typescript
"use server"
import { auth } from "@/shared/lib/auth"
import { toPlain } from "@/shared/domain/serialize"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"
import { logger } from "@/shared/lib/logger"

const invoiceRepo = new DrizzleInvoiceRepository()
const createInvoiceUC = new CreateInvoiceHandler(invoiceRepo)

export async function createInvoiceAction(input: { amount: number }) {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized", data: null }

  try {
    const invoice = await createInvoiceUC.execute({ ...input, user: session.user })
    return { success: true, data: toPlain(invoice), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "CREATE INVOICE ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}
```

Three things every mutation action must do: resolve `user` before calling the handler (never pass `session?.user` optionally into a required field), catch `DomainException` specifically, and call `toPlain()` on anything returned to a Client Component — entities are classes, and Next's RSC serializer rejects class instances outright (it does **not** call `toJSON()` automatically, unlike `JSON.stringify`). This is a runtime-only failure invisible to `tsc` — you'll only catch a missed `toPlain()` by actually clicking the feature in a browser.

`src/app/` stays thin: pages call Server Actions, never repositories or handlers directly.

## 7. UI — pages, forms, layout tokens

Reference: `src/modules/products/presentation/ui/pages/list.tsx` and `components/form/index.tsx`.

- Forms: `react-hook-form` + `zodResolver`, inline `<FormMessage>` errors — not manual `useState` + toast-only validation (an earlier version of the `setting` module did this and it was a real, flagged inconsistency).
- Destructive confirmations: shadcn `AlertDialog`, never the browser's native `confirm()`.
- Layout: use the semantic classes in `src/app/globals.css`'s `@layer components` block instead of one-off Tailwind values:

  ```tsx
  <div className="page-shell">
    <div className="page-header">
      <h1 className="page-title">Invoices</h1>
      <Button asChild><Link href={routes.dashboard.invoices.create}>Create Invoice</Link></Button>
    </div>
    <Card><CardContent><InvoiceTable data={invoices} /></CardContent></Card>
  </div>
  ```

  `.page-shell` / `.page-header` / `.page-title` / `.page-description` / `.content-stack` / `.form-stack` / `.icon-sm` / `.icon-md` cover the vast majority of page layouts. Reach for a raw `space-y-*`/`gap-*`/`text-3xl` value only when nothing in that list fits — and if you find yourself repeating the same one-off value across 3+ pages, that's a signal it belongs in `globals.css` as a new named class, not copy-pasted.
- **`data-testid`** every interactive element: `{field}-input`, `{action}-submit-button`, `{entity}-form`, `{action}-button-${id}` for per-row actions. See `AGENTS.md` §8 for the full convention.

## 8. Route + sidebar nav

Add the route to `src/shared/config/routes.ts` — never hardcode a path string in a component. Add the nav entry to `src/shared/config/menu.ts`. **If your module has a top-level page with no sub-pages, give it no `children` array** — items with `children` render as an expand/collapse accordion trigger with no direct link of their own (this caused a real bug: a module's main page became unreachable from the sidebar because its only "child" pointed elsewhere). If you do need children, make sure one of them points at the module's own root page.

## 9. Seeder

```typescript
// src/modules/invoices/infrastructure/seeder.ts
export async function seed(db: NodePgDatabase) {
  console.log("🧾 [Invoices] Seeding demo invoices...")
  // ...
}
```

`scripts/seed.ts` discovers this automatically — no registration step needed. Keep demo data domain-neutral (no hardcoded company/business names beyond generic placeholders) since this is a boilerplate anyone forks.

## 10. Tests

At minimum, one `application/__tests__/invoices.test.ts` covering: the handler's permission-gated success/throw paths, and the entity's `create()` throwing on invalid input vs. `reconstruct()` not validating. Reference: `src/modules/products/application/__tests__/products.test.ts` for the mocking pattern (`mock(() => Promise.resolve(...))`).

---

## Checklist before you call it done

- [ ] `bun run typecheck` and `bun run lint` clean
- [ ] `bun run test:unit` passes, new tests added
- [ ] Every mutation checks `can()` and requires `user` on its command
- [ ] Every mutation dispatches a domain event instead of calling side effects directly
- [ ] Server Actions call `toPlain()` before returning entity data
- [ ] New pages use the `.page-*`/`.form-*`/`.icon-*` classes from `globals.css`
- [ ] Sidebar nav entry added and actually reachable (click it, don't just read the config)
- [ ] Manually clicked through the feature in a browser — a green build is not the same as a working feature (this repo has a documented history of runtime-only bugs that `tsc`/`eslint` never caught)
