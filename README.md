# 🛠️ ForgeKit Next.js Boilerplate

An enterprise-grade, highly scalable Next.js boilerplate built with strict **Domain-Driven Design (DDD)** principles. ForgeKit is designed to be future-proof, maintainable, and type-safe from the database layer all the way to the UI presentation layer.

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) (PostgreSQL)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives + Tailwind CSS)
- **Data Grids**: [TanStack Table v8](https://tanstack.com/table/latest) (Headless UI logic)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Authentication**: [NextAuth.js (v5 / Auth.js)](https://authjs.dev/)

---

## 🏗️ Architecture: 4-Layer Domain-Driven Design (DDD)

ForgeKit strictly enforces a modular 4-Layer DDD architecture. Every feature (e.g., `products`, `users`, `orders`) is isolated into its own domain module. This ensures that the codebase remains scalable and decoupled.

```text
src/
├── app/                  # Thin App Router (Entry points only)
└── modules/
    └── [bounded-context]/# E.g., products, users, audit-logs
        ├── domain/       
        │   ├── entities/        # Core Business Entities & Types (No frameworks)
        │   ├── exceptions/      # Custom domain exceptions (e.g. UserNotFoundException)
        │   ├── repositories/    # Interfaces for data access ports
        │   └── value-objects/   # Domain Value Objects
        ├── application/  
        │   └── use-cases/       # Business Logic Handlers & Command DTOs (Zod)
        ├── infrastructure/
        │   ├── database/drizzle/# DB Schemas & Migrations
        │   ├── repositories/    # Drizzle Repositories Adapters
        │   └── services/        # External services adapters (e.g. Bcrypt hasher)
        └── presentation/ 
            ├── http/actions/    # Next.js Server Actions (Use Case entry points)
            └── ui/              # UI Components, Pages, and Hooks
```

### 1. Domain Layer (`domain/`)
The absolute core of the module. It contains pure TypeScript entities (e.g., `UserEntity`), Custom Exceptions, and Port Interfaces (e.g. `IUserRepository`). **Rule**: It must NOT depend on any other layer or external framework.

### 2. Application Layer (`application/`)
Contains business logic orchestration strictly separated into isolated **Use Cases** (e.g., `register-user.handler.ts`) and Data Transfer Object validations (Zod schemas). **Rule**: It dictates *what* happens, not *how* data is fetched or displayed.

### 3. Infrastructure Layer (`infrastructure/`)
Handles all external communications, specifically the Database. Contains Drizzle ORM schemas and Repositories Adapters that implement Domain Ports. **Rule**: This is the ONLY layer that communicates with external systems.

### 4. Presentation Layer (`presentation/`)
Contains everything the user interacts with. 
- `ui/pages/`: Page assemblies.
- `ui/components/`: Reusable components (Forms, Tables).
- `http/actions/`: Next.js Server Actions. Acts as the strictly-typed bridge between the UI and the Application Layer.

---

## 🔒 DevSecOps & Security Enforcement
ForgeKit implements strict "secure-by-default" patterns:
- **Centralized Audit Logging**: The `audit-logs` module captures critical system activities.
- **Strict Role Guards**: Administrative use cases strictly validate roles (e.g. checking for `super_admin`) at the Application layer, preventing privilege escalation.
- **Abstraction Over Crypto**: Cryptographic operations (like password hashing) are decoupled via Ports (e.g., `IPasswordHasher`) to prevent logic leak.

---

## 🧩 Key Concepts & Best Practices

1. **Thin App Router**
   The `src/app/` directory is kept intentionally "thin". Files like `app/(dashboard)/products/page.tsx` should ONLY call a service and return a Presentation Page component. Absolutely no UI layout or complex logic should reside in `src/app`.
   
2. **No `any` Types Allowed**
   The codebase is strictly typed. All database fetches map to explicit domain entities (e.g., `UserEntity`). Forms strictly adhere to Zod validation schemas. `bun run typecheck` MUST pass without errors.

3. **Separation of Logic and UI**
   UI components must be "dumb". If a component requires complex state (e.g., handling form submissions, managing deletion states, triggering toasts), that logic MUST be extracted into a custom hook (e.g., `useProductForm`).

4. **Server Actions First**
   Mutations are handled exclusively via Server Actions located in `presentation/ui/actions.ts`. These actions validate input, call the Application Service, and return a standardized `{ success: boolean, data?: T, error?: string }` object.

5. **Dynamic Modular Seeding**
   Every module manages its own data seeding locally under `infrastructure/seeder.ts` by exporting a named `seed` function: `export async function seed(db: NodePgDatabase)`. The global seeder runner `scripts/seed.ts` automatically scans the `modules/` directory at runtime, imports active seeders dynamically, and executes them with full type-safety and 100% decoupling.

---

## 💻 Getting Started

### Prerequisites
- Install [Bun](https://bun.sh/)
- PostgreSQL database (Local or Cloud)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   bun install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and configure your database and authentication keys:
   ```bash
   cp .env.example .env.local
   ```

3. **Database Setup**
   Push the Drizzle schema to your PostgreSQL database:
   ```bash
   bun run db:push
   ```

4. **Start Development Server**
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Commands

- `bun run dev`: Starts the development server.
- `bun run build`: Builds the application for production.
- `bun run typecheck`: Runs strict TypeScript verification without emitting files. **(Must pass before committing)**
- `bun run lint`: Analyzes code for ESLint errors.
- `bun run test`: Runs the unified test runner (runs both Unit & E2E tests).
- `bun run test:unit`: Runs Unit & Validation tests only.
- `bun run test:e2e`: Runs E2E browser tests only.
- `bun run db:generate`: Generates SQL migrations from Drizzle schemas.
- `bun run db:push`: Pushes schema changes directly to the database.
- `bun run db:seed`: Runs the dynamic database seeder engine (seeds all modules).
- `bun run db:seed --module <name>`: Runs the database seeder for a specific module (e.g. `--module users`).
- `bun run db:studio`: Opens Drizzle Studio to inspect database tables.

---

## 🧪 Testing Architecture

ForgeKit implements a strict, enterprise-grade automated testing system separated into Unit & Validation Tests and browser-driven E2E Tests, orchestrated by a **Unified Test Runner CLI**.

### 1. Structure
- **Unit & Validation Tests**: Placed under the Application layer of each module (`src/modules/[module-name]/application/__tests__/*.test.ts`). Powered by the ultra-fast `bun test` runner.
- **E2E Browser Tests**: Placed in a centralized E2E test folder (`tests/e2e/*.e2e.ts`) using **Playwright**.
- **Results Centralization**: All Playwright E2E reports and failure assets (videos, screenshots, trace logs) are saved inside `/tests/playwright-report/` and `/tests/test-results/`. They are globally ignored by the Git repository and excluded from the ESLint compiler for maximum efficiency.

### 2. Using the Unified Runner (`scripts/test-runner.ts`)

You can run Unit, E2E, or both types of tests across the entire codebase or target a specific module:

#### A. Run Everything (Unit + E2E)
- **All modules**: `bun run test`
- **Specific module**: `bun run test --module products`

#### B. Run Unit Tests Only (`-u`)
- **All modules**: `bun run test:unit`
- **Specific module**: `bun run test:unit --module products`

#### C. Run E2E Tests Only (`-e`)
- **All modules**: `bun run test:e2e`
- **Specific module**: `bun run test:e2e --module products`

#### D. Visual E2E Execution (`--headed` & `--ui`)
Watch Playwright interact with your browser in real-time or open the interactive Playwright UI Dashboard by appending `--headed` or `--ui`:
- **Headed Mode**: `bun run test:e2e --module products --headed`
- **UI Mode (Dashboard)**: `bun run test:e2e --module products --ui`

#### E. View Playwright Report HTML
Inspect detailed E2E test runs, traces, videos, and screenshots:
```bash
npx playwright show-report tests/playwright-report
```

---

## 📖 Blueprint for Adding a New Module

When adding a new feature (e.g., `Invoices`), copy the structure of an existing robust module like `products`.

1. Create `src/modules/invoices/`.
2. Define `InvoiceEntity` and `IInvoiceRepository` in `domain/entities/` and `domain/repositories/`.
3. Create custom exceptions like `InvoiceNotFoundException` in `domain/exceptions/`.
4. Create Drizzle `schema.ts` in `infrastructure/database/drizzle/`.
5. Implement the repository adapter in `infrastructure/repositories/drizzle-impl/`.
6. Create Use Cases (e.g., `create-invoice.handler.ts` and `create-invoice.command.ts`) in `application/use-cases/create-invoice/`.
7. Expose Server Actions in `presentation/http/actions/invoice.actions.ts`.
8. Build Headless UI hooks and components in `presentation/ui/`.
9. Assemble UI Pages in `presentation/ui/pages/` and route them in `src/app/(dashboard)/invoices/`.

---

*Built with precision to scale infinitely.*
