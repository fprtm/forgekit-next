# 🧪 ForgeKit Automated Testing Documentation

This document explains the testing architecture, strategies, guidelines, and commands for the ForgeKit 4-layer DDD codebase.

---

## 🏗️ Testing Architecture Overview

ForgeKit divides testing into two primary categories to maintain high code confidence, performance, and clean separation of concerns:

```
src/modules/
└── [module-name]/
    └── application/
        └── __tests__/           <-- 1. Unit & Validation Tests (*.test.ts)

tests/
├── e2e/                         <-- 2. Centralized E2E Tests (*.e2e.ts)
├── playwright-report/           <-- 3. Playwright HTML Laporan (Git & ESLint Ignored)
└── test-results/                <-- 4. Screenshots/Videos/Traces (Git & ESLint Ignored)
```

### 1. Unit & Validation Tests (`*.test.ts`)
- **Location**: Located in the application layer of their respective module (`src/modules/[module-name]/application/__tests__/*.test.ts`).
- **Focus**: Validates pure business logic, Zod validation schemas (`createProductSchema`, `updateProductSchema`, etc.), and application services.
- **Engine**: Powered by **Bun Test** for ultra-fast, zero-overhead execution.

### 2. End-to-End (E2E) Browser Tests (`*.e2e.ts`)
- **Location**: Centralized in the root directory under `tests/e2e/*.e2e.ts`.
- **Focus**: Simulates full user journeys, browser interactions, page rendering, navigation flows, form submission behaviors, and database operations.
- **Engine**: Powered by **Playwright**.

---

## 🛠️ Unified Test Runner (`scripts/test-runner.ts`)

Instead of managing separate commands for unit and E2E tests, ForgeKit provides a **Unified CLI Test Runner** located at `scripts/test-runner.ts`. It allows running different test categories and filtering by module using standard flags.

### CLI Syntax
```bash
bun run test [type] [--module <module-name>] [browser-options]
```

### Type Flags
- `(no flag)` or `--ue` (Default): Runs both Unit and E2E tests.
- `-u`: Runs Unit tests only.
- `-e`: Runs E2E tests only.

### Browser Options (E2E only)
- `--headed`: Opens the visual browser window in real-time.
- `--ui`: Opens Playwright's interactive desktop dashboard.

---

## 🚀 Execution Guide & Examples

### 1. Run All Tests
To run both Unit and E2E tests for the **entire codebase**:
```bash
bun run test
```

### 2. Target a Single Module
To run all tests (Unit + E2E) for the **Products module** only:
```bash
bun run test --module products
```

### 3. Run Unit Tests Only
- **All modules**:
  ```bash
  bun run test:unit
  ```
- **Specific module (e.g. Users)**:
  ```bash
  bun run test:unit --module users
  ```

### 4. Run E2E Tests Only
- **All modules**:
  ```bash
  bun run test:e2e
  ```
- **Specific module**:
  ```bash
  bun run test:e2e --module products
  ```

### 5. Running Visual/Interactive E2E Tests
To watch the browser click and fill forms in real-time or open the Playwright dashboard:
- **Headed Mode**:
  ```bash
  bun run test:e2e --module products --headed
  ```
- **UI Mode (Playwright Dashboard)**:
  ```bash
  bun run test:e2e --module products --ui
  ```

---

## 📁 Centralized Reports & Results

All artifacts produced during E2E test executions (HTML reports, screenshots of failures, video recordings of user actions, and trace files) are stored strictly inside the `tests/` directory:

- HTML Laporan: `tests/playwright-report/`
- Failure Assets: `tests/test-results/`

### Viewing E2E HTML Reports
To launch Playwright's report viewer to analyze the details of E2E runs:
```bash
npx playwright show-report tests/playwright-report
```

---

## 🧩 Best Practices for Writing Tests

1. **Keep Unit Tests Clean & Fast**: Avoid database connections or external API calls inside `.test.ts` files. Mock repositories if needed.
2. **Encapsulate E2E Scenarios**: E2E tests should represent positive and critical path journeys (e.g., successful crud flows).
3. **Database Cleanliness in E2E**: E2E tests interact with a live database. Use isolated test accounts/products and clean up test data if necessary, or use random unique IDs (e.g., `Test Product ${Date.now()}`) to avoid duplicates.
4. **No Unused/Unsafe Types**: Ensure all tests are strictly typed. Never use `any` in validations or parameters.
