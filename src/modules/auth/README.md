````markdown
# 🛡️ ForgeKit Authorization Module

The ForgeKit Authorization Module utilizes a decoupled, unopinionated **Domain-Policy Authorization (RBAC + ABAC)** approach that aligns with **Domain-Driven Design (DDD)** principles.

Instead of performing primitive role checks across the application, the system declaratively evaluates Actions and Resource Contexts.

---

## 🏗️ Key Features & Architecture

1.  **Strict Type Safety (No `any`):** All authorization actions are bound to an `Action` union type.
2.  **Decoupled Policy Registry:** The authorization module is completely unopinionated about the database schema or entity columns of other modules. New modules can dynamically register their own ownership validators.
3.  **Fail-Fast Developer Engine:** If a developer performs a resource-level authorization check but forgets to register a validator or omits the ownership property on the database object, the engine will **immediately throw a descriptive crash error** during development/testing. This actively prevents silent bugs from reaching production.
4.  **Multi-Layer Guarding:** Authorization is enforced across multiple layers: the UI Layer (Menus/Sidebars/Components), the API Layer (HTTP Handlers), and the Application Layer (Services).

---

## 📂 Usage & Implementation Guide

### 1. Adding/Configuring a Module (Example: `Products`)

#### Step A: Register Actions in `src/modules/auth/domain/types.ts`

Ensure the action types are defined in the `Action` union to guarantee type safety across the entire project:

```typescript
export type Action =
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "products:create" // ⬅️ Product Actions
  | "products:read"
  | "products:update"
  | "products:delete";
```
````

#### Step B: Register Custom Validators (In the Module's Service)

The ownership logic (e.g., checking the `sellerId` field) is registered directly within the respective module (e.g., `src/modules/products/application/services.ts`). This keeps the `auth` module completely clean:

```typescript
import { authPolicies } from "@/modules/auth/domain/policies";

// Only the owner/seller of the product (sellerId) is allowed to update/delete their product
authPolicies.registerValidator("products:update", (user, product) => {
  const sellerId = product.sellerId;
  return typeof sellerId === "string" ? sellerId === user.id : true;
});

authPolicies.registerValidator("products:delete", (user, product) => {
  const sellerId = product.sellerId;
  return typeof sellerId === "string" ? sellerId === user.id : true;
});
```

---

### 2. Guarding the Service Layer (Layer 2 - Resource Guard)

Enforce authorization inside application service methods. If the check fails, throw a `Forbidden` error:

```typescript
import { can } from "@/modules/auth/domain/policies";
import { AuthUser } from "@/modules/auth/domain/types";

export const ProductsService = {
  async updateProduct(id: string, input: UpdateProductDTO, user?: AuthUser) {
    const existing = await ProductsRepository.findById(id);
    if (!existing) throw new Error("Product not found");

    if (user) {
      // 💡 Automatically executes the 'products:update' validator
      if (!can(user, "products:update", existing)) {
        throw new Error("Forbidden");
      }
    }

    return ProductsRepository.update(id, input);
  },
};
```

---

### 3. Guarding API Routes (Layer 1 - Action Guard)

Use Layer 1 to filter basic HTTP requests at the handler level before they even touch the data:

```typescript
import { auth } from "@/lib/auth";
import { can } from "@/modules/auth/domain/policies";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  const user = session?.user
    ? { id: session.user.id, role: session.user.role }
    : null;

  // Check basic user authorization
  if (!user || !can(user, "products:update")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed to call the service (Layer 2 will check resource ownership)
  const body = await req.json();
  const updated = await ProductsService.updateProduct(params.id, body, user);
  return NextResponse.json(updated);
}
```

---

### 4. Guarding the UI (PermissionGate)

Wrap UI elements, such as action buttons, using the `<PermissionGate>` component to conditionally render elements in a type-safe manner:

```tsx
import { PermissionGate } from "@/modules/auth/presentation/ui/components/permission-gate";

export function ProductActions({ product, currentUser }) {
  return (
    <div className="flex gap-2">
      <PermissionGate // The action="products:update" className="text-sm text-gray-500" context fallback="{<p" product resource="{product}" user="{currentUser}">Only the seller can edit this.</p>}
      >
        <button onClick={() => editProduct(product.id)}>Edit Product</button>
      </PermissionGate>
    </div>
  );
}
```

---

## 🚨 The Fail-Fast Engine (Production Savior)

If you call:

```typescript
can(user, "products:update", productContext);
```

But:

1. You **forgot** to register a custom validator in your module (`authPolicies.registerValidator`).
2. The `productContext` object **does not have** any of the standard ownership columns (`ownerId`, `userId`, `sellerId`, `authorId`, `createdBy`).

The system will not fail silently or allow a security breach! The authorization engine will **immediately throw a Crash Exception**:

> `[Authorization Failure - Fail-Fast Registry] Action 'products:update' requires resource validation, but no domain validator has been registered and the provided resource context has no standard ownership keys...`

With this active protection, all authorization integration bugs are guaranteed to be caught instantly during unit testing or in your local development environment!

```

```
