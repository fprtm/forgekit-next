import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { UserLoggedInEvent, UserLoggedOutEvent } from "@/modules/auth/domain/events/auth.events";
import { UserImpersonatedEvent, UserImpersonationStoppedEvent } from "@/modules/auth/domain/events/impersonate.events";
import { LogActionHandler } from "@/modules/audit-logs/application/use-cases/log-action/log-action.handler";
import { IAuditLogRepository } from "@/modules/audit-logs/domain/repositories/audit-log-repository.interface";

export class AuthAuditListener {
  private readonly logActionUC: LogActionHandler;

  constructor(auditLogRepo: IAuditLogRepository) {
    this.logActionUC = new LogActionHandler(auditLogRepo);
  }

  public registerListeners(): void {
    eventDispatcher.register<UserLoggedInEvent>("UserLoggedInEvent", async (event) => {
      await this.logActionUC.execute({
        action: "CREATE",
        entityName: "Auth",
        actorId: event.userId,
        details: `User logged in from IP: ${event.ipAddress || 'unknown'}`,
      }).catch(console.error);
    });

    eventDispatcher.register<UserLoggedOutEvent>("UserLoggedOutEvent", async (event) => {
      await this.logActionUC.execute({
        action: "UPDATE",
        entityName: "Auth",
        actorId: event.userId,
        details: `User logged out`,
      }).catch(console.error);
    });

    eventDispatcher.register<UserImpersonatedEvent>("UserImpersonatedEvent", async (event) => {
      await this.logActionUC.execute({
        action: "CREATE",
        entityName: "Auth",
        actorId: event.superAdminId,
        details: `Superadmin started impersonating User: ${event.targetUserId}`,
      }).catch(console.error);
    });

    eventDispatcher.register<UserImpersonationStoppedEvent>("UserImpersonationStoppedEvent", async (event) => {
      await this.logActionUC.execute({
        action: "UPDATE",
        entityName: "Auth",
        actorId: event.superAdminId,
        details: `Superadmin stopped impersonating User: ${event.targetUserId}`,
      }).catch(console.error);
    });
  }
}
