# 🏗️ ForgeKit Modules: Strict Clean Architecture (DDD)

Welcome to the **ForgeKit Modules** directory. This is the heart of the application's business logic. 

To ensure maximum scalability, maintainability, and enterprise-grade robustness, this boilerplate strictly enforces a **4-Layer Clean Architecture (Domain-Driven Design)** for every module.

## 📖 The 4-Layer Taxonomy

When creating a new module (e.g., `products`, `users`, `payments`), you **must** adhere to the following directory structure:

```text
src/modules/<module-name>/
├── domain/                     # 1. CORE LAYER (Business Logic & Rules)
│   ├── entities/               # Core business objects with state & behavior (e.g., User.ts).
│   ├── events/                 # Domain events (e.g., UserCreatedEvent.ts).
│   ├── exceptions/             # Custom error classes (prevent stack-trace leaks for security).
│   ├── repositories/           # Repository interfaces (contracts, not implementations).
│   └── value-objects/          # Immutable objects (e.g., Email, Money).
│
├── application/                # 2. USE CASES LAYER (Application Logic)
│   ├── services/               # Orchestrates domain objects to fulfill use cases.
│   ├── use-cases/              # Segregated files for single actions (e.g., create-user, login).
│   └── __tests__/              # Unit tests for application logic.
│
├── infrastructure/             # 3. EXTERNAL LAYER (Data & Third-Party)
│   ├── database/               # DB schemas, configs, and ORM setup.
│   │   └── drizzle/migrations/ # Version-controlled DB migrations (Audit & Compliance).
│   ├── repositories/           # Concrete implementation of domain/repositories (e.g., drizzle-impl).
│   └── services/               # Third-party services integration (e.g., AWS S3, Stripe).
│
└── presentation/               # 4. DELIVERY LAYER (Web, API, CLI)
    ├── http/                   # HTTP endpoints and request handlers.
    │   ├── actions/            # Next.js Server Actions (Requires strict AuthZ/CSRF validation).
    │   └── controllers/        # Express/Next.js API Route controllers.
    ├── ui/                     # React UI Delivery Mechanism.
    │   ├── components/         # Atomic UI specific to this module (form, table).
    │   ├── hooks/              # Custom React hooks (e.g., useUser).
    │   └── pages/              # Full page compositions.
    └── __tests__/              # UI and Integration tests.
```

## 🔍 DevSecOps & Architecture Audit Notes

1. **Dashboard Module Exception**: The `dashboard` module does not have a `domain` layer. In strict DDD, this is an acceptable pattern if the module is purely a **Read Model (CQRS)** mapping raw database rows to the UI, circumventing domain logic for performance.
2. **Empty Folders (Placeholder/`.gitkeep`)**: Rather than spamming empty directories with `README.md` files, this central document serves as the source of truth for the purpose of sub-directories like `events/`, `exceptions/`, and `value-objects/`. 
3. **Security Constraints**: 
   - Never leak implementation details or stack traces via `domain/exceptions/`. Sanitization must happen before crossing into the `presentation/http/` layer.
   - Inputs crossing into `presentation/http/actions` (Server Actions) must be validated with Zod and checked for authorization context, preventing Insecure Direct Object Reference (IDOR).
4. **Deep UI Separation**: Complex UI elements (like forms and tables) must have their own dedicated folders inside `presentation/ui/components/` to prevent clutter as features scale.

> By following this blueprint, your codebase will remain pristine, easy to onboard new engineers, and capable of scaling infinitely without becoming spaghetti code!
