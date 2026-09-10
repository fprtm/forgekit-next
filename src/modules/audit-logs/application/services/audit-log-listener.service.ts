import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { ProductCreatedEvent, ProductUpdatedEvent, ProductDeletedEvent } from "@/modules/products/domain/events/product.events";
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent, UserRegisteredEvent } from "@/modules/users/domain/events/user.events";
import { AuditActivityLogger } from "./audit-activity-logger.service";
import { IAuditLogRepository } from "@/modules/audit-logs/domain/repositories/audit-log-repository.interface";

export class AuditLogListener {
  private readonly activityLogger: AuditActivityLogger;

  constructor(auditLogRepo: IAuditLogRepository) {
    this.activityLogger = new AuditActivityLogger(auditLogRepo);
  }

  public registerListeners(): void {
    // Product Events
    eventDispatcher.register<ProductCreatedEvent>("ProductCreatedEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.userId,
        action: "product:create",
        details: `Product created: ${event.product.name} (Price: $${event.product.price})`,
      });
    });

    eventDispatcher.register<ProductUpdatedEvent>("ProductUpdatedEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.userId,
        action: "product:update",
        details: `Product updated: id=${event.product.id} (Name: ${event.product.name})`,
      });
    });

    eventDispatcher.register<ProductDeletedEvent>("ProductDeletedEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.userId,
        action: "product:delete",
        details: `Product deleted: id=${event.productId} (Name: ${event.productName})`,
      });
    });

    // User Events
    eventDispatcher.register<UserCreatedEvent>("UserCreatedEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.adminId,
        action: "user:create",
        details: `User created: id=${event.user.id} (Email: ${event.user.email}, Role: ${event.user.role})`,
      });
    });

    eventDispatcher.register<UserUpdatedEvent>("UserUpdatedEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.adminId,
        action: "user:update",
        details: `User profile updated: id=${event.user.id} (Name: ${event.user.name}, Role: ${event.user.role})`,
      });
    });

    eventDispatcher.register<UserDeletedEvent>("UserDeletedEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.adminId,
        action: "user:delete",
        details: `User deleted: id=${event.deletedUser.id} (Email: ${event.deletedUser.email}, Role: ${event.deletedUser.role})`,
      });
    });

    eventDispatcher.register<UserRegisteredEvent>("UserRegisteredEvent", async (event) => {
      await this.activityLogger.logActivity({
        userId: event.user.id,
        action: "user:register",
        details: `User registered: id=${event.user.id} (Email: ${event.user.email}, Role: ${event.user.role})`,
      });
    });
  }
}
