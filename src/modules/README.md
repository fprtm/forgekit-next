# 🏗️ ForgeKit Modules: Strict Clean Architecture (DDD)

Welcome to the **ForgeKit Modules** directory. This is the heart of the application's business logic. 

To ensure maximum scalability, maintainability, and enterprise-grade robustness, this boilerplate strictly enforces a **4-Layer Clean Architecture (Domain-Driven Design)** for every module.

## 📖 The 4-Layer Taxonomy

When creating a new module (e.g., `products`, `users`, `payments`), you **must** adhere to the following directory structure:

```text
src/modules/<module-name>/
├── domain/                 # 1. CORE LAYER
│   └── types.ts            # Pure TypeScript types, interfaces, and entities. NO external dependencies.
│
├── application/            # 2. USE CASES LAYER
│   ├── validations.ts      # Data Transfer Objects (DTOs) and Zod Schemas.
│   ├── services.ts         # Business logic rules. Orchestrates domain models and repositories.
│   └── use-cases/          # 💡 [SCALE NOTE]: If services.ts becomes too large, split it into individual files here (e.g., create-user.ts, get-user.ts).
│
├── infrastructure/         # 3. EXTERNAL LAYER
│   ├── schema.ts           # Drizzle ORM schemas (Database models).
│   └── repository.ts       # Direct database queries (find, create, update, delete).
│
└── presentation/           # 4. DELIVERY LAYER
    ├── http/               # API route handlers (JSON Request/Response).
    │   └── route-handlers.ts 
    │
    └── ui/                 # React UI Delivery Mechanism.
        ├── components/     # Module-specific, isolated UI components.
        │   ├── form/       # e.g., product-form component
        │   └── table/      # e.g., product-table component
        └── pages/          # Full React pages composing the components above.
```

## ⚖️ Rules of the Architecture

1. **The Dependency Rule**: Dependencies must *only* point inward toward the `domain`. 
   - `presentation` can import `application`.
   - `application` can import `infrastructure` (via dependency injection or direct calls in our pragmatic setup) and `domain`.
   - `domain` **cannot** import anything from `application`, `infrastructure`, or `presentation`.
2. **Thin Next.js App Router**: Files inside `src/app/` should contain **absolutely zero business logic**. They act strictly as a "Thin Router" mapping URLs to the handlers/pages inside `presentation/`.
3. **Deep UI Separation**: Complex UI elements (like forms and tables) must have their own dedicated folders inside `presentation/ui/components/` to prevent clutter as features scale.

> By following this blueprint, your codebase will remain pristine, easy to onboard new engineers, and capable of scaling infinitely without becoming spaghetti code!
