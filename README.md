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
    └── [module-name]/    # E.g., products, users
        ├── domain/       # Layer 1: Core Business Entities & Types (No frameworks)
        ├── application/  # Layer 2: Business Logic, Services & Validations (Zod)
        ├── infrastructure/# Layer 3: Database Schemas, Repositories (Drizzle)
        └── presentation/ # Layer 4: UI Components, Pages, and Server Actions
```

### 1. Domain Layer (`domain/`)
The core of the module. It contains pure TypeScript interfaces and entities (e.g., `ProductEntity`, `UserEntity`). **Rule**: It must NOT depend on any other layer or external framework.

### 2. Application Layer (`application/`)
Contains business logic orchestration (Services) and Data Transfer Object validations (Zod schemas). **Rule**: It dictates *what* happens, not *how* data is fetched or displayed.

### 3. Infrastructure Layer (`infrastructure/`)
Handles all external communications, specifically the Database. Contains Drizzle ORM schemas and Repositories. **Rule**: This is the ONLY layer that communicates with the database.

### 4. Presentation Layer (`presentation/`)
Contains everything the user interacts with. 
- `ui/pages/`: Page assemblies.
- `ui/components/`: Reusable components (Forms, Tables). Uses custom hooks (`useProductForm`, `useProductTable`) to keep JSX clean from business logic.
- `ui/actions.ts`: Next.js Server Actions. Acts as the strictly-typed bridge between the UI and the Application Layer.

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
2. Define `InvoiceEntity` in `domain/types.ts`.
3. Create `schema.ts` and `repository.ts` in `infrastructure/`.
4. Create `validations.ts` (Zod) and `services.ts` in `application/`.
5. Create `actions.ts` in `presentation/ui/`.
6. Build Headless UI hooks (`useInvoiceTable`, `useInvoiceForm`) and components in `presentation/ui/components/`.
7. Assemble `list.tsx`, `create.tsx`, `edit.tsx` in `presentation/ui/pages/`.
8. Wire up the routes inside `src/app/(dashboard)/invoices/`.

---

*Built with precision to scale infinitely.*
