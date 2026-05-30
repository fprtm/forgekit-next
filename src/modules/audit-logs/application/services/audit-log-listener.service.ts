import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent } from "@/modules/products/domain/events/product.events";
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent, UserRegisteredEvent } from "@/modules/users/domain/events/user.events";
import { logActivityUC } from "@/modules/audit-logs/presentation/http/actions/audit-log.actions"; // Importing the UC instance directly to avoid rewriting its initialization. Alternatively, we should use the UC directly.

export class AuditLogListener {
  public registerListeners(): void {
    // Product Events
    eventDispatcher.register<ProductCreatedEvent>("ProductCreatedEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.userId,
        action: "product:create",
        details: `Product created: ${event.product.name} (Price: $${event.product.price})`,
      });
    });

    eventDispatcher.register<ProductUpdatedEvent>("ProductUpdatedEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.userId,
        action: "product:update",
        details: `Product updated: id=${event.product.id} (Name: ${event.product.name})`,
      });
    });

    eventDispatcher.register<ProductDeletedEvent>("ProductDeletedEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.userId,
        action: "product:delete",
        details: `Product deleted: id=${event.productId} (Name: ${event.productName})`,
      });
    });

    // User Events
    eventDispatcher.register<UserCreatedEvent>("UserCreatedEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.adminId,
        action: "user:create",
        details: `User created: id=${event.user.id} (Email: ${event.user.email}, Role: ${event.user.role})`,
      });
    });

    eventDispatcher.register<UserUpdatedEvent>("UserUpdatedEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.adminId,
        action: "user:update",
        details: `User profile updated: id=${event.user.id} (Name: ${event.user.name}, Role: ${event.user.role})`,
      });
    });

    eventDispatcher.register<UserDeletedEvent>("UserDeletedEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.adminId,
        action: "user:delete",
        details: `User deleted: id=${event.deletedUser.id} (Email: ${event.deletedUser.email}, Role: ${event.deletedUser.role})`,
      });
    });

    eventDispatcher.register<UserRegisteredEvent>("UserRegisteredEvent", async (event) => {
      await logActivityUC.execute({
        userId: event.user.id,
        action: "user:register",
        details: `User registered: id=${event.user.id} (Email: ${event.user.email}, Role: ${event.user.role})`,
      });
    });
  }
}

// Initialize and register listeners
export const auditLogListener = new AuditLogListener();
auditLogListener.registerListeners();
