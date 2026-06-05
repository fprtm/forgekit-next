<!-- BEGIN:nextjs-agent-rules -->
# 🏗️ ForgeKit AI Agent Directives (STRICT)

This repository enforces a strict, modular **Clean Architecture (Domain-Driven Design)** combined with **Event-Driven Architecture**. AI Agents interacting with this codebase MUST strictly adhere to the following rules. Any violation of these rules is considered a failure.

## ⚖️ 1. Core Architectural Constraints
- **Zero Business Logic in App Router**: Files inside `src/app/` MUST act strictly as a "Thin Delivery Mechanism". They only map URLs to handlers (`presentation/http/controllers` or `actions`). NEVER put database calls or business rules in `src/app/`.
- **Inward Dependency Rule**: Dependencies must only point inward: `Presentation -> Application -> Domain`. The `Domain` layer must have ZERO external dependencies (no UI, no DB, no framework imports).
- **Sub-folder Utilization**: You must use the granular structure inside modules (`domain/events`, `domain/exceptions`, `presentation/http/controllers`, etc.). **Do not leave these folders empty or mock them.**

## 🛡️ 2. Strict DevSecOps & Security
- **Domain Exceptions**: NEVER throw generic `Error` instances in Use Cases. Always throw classes extending `DomainException` (e.g., `UnauthorizedException`, `ProductNotFoundException`) located in `domain/exceptions/`. 
- **Stack Trace Protection**: Server Actions and Controllers MUST catch `DomainException` to return safe error messages to the client. Generic internal errors must be masked as `"Internal Server Error"` and logged on the server.
- **IDOR & AuthZ**: Every Server Action or Use Case modifying/deleting data MUST verify user permissions (using `can()` from policies) and check ownership.

## 📡 3. Event-Driven Side Effects
- **No Manual Side-Effects in Use Cases/Actions**: Business actions (like triggering Audit Logs, sending emails, or pushing notifications) MUST NOT be executed directly within Server Actions or the primary Use Case execution path.
- **Domain Events**: Use Cases must dispatch a `DomainEvent` (e.g., `ProductCreatedEvent`) via `eventDispatcher.dispatch()`.
- **Listeners**: Side-effects must be handled by dedicated listeners (e.g., `AuditLogListener`) in the `application/services` layer that subscribe to those Domain Events.

## 🧹 4. General Guidelines
- **Always Read Existing Patterns**: Analyze structures in modules like `products` or `users`. Never invent a new pattern if one already exists.
- **Zero Deadcode**: Ensure all changes are clean, functional, do not have warning tags, and avoid any unused code.
<!-- END:nextjs-agent-rules -->
