import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { UserLoggedInEvent, UserLoggedOutEvent } from "@/modules/auth/domain/events/auth.events";
import { LogActionHandler } from "@/modules/audit-logs/application/use-cases/log-action/log-action.handler";
import { DrizzleAuditLogRepository } from "@/modules/audit-logs/infrastructure/repositories/drizzle-impl/drizzle-audit-log.repository";

const auditLogRepo = new DrizzleAuditLogRepository();
const logActionUC = new LogActionHandler(auditLogRepo);

export class AuthAuditListener {
  public registerListeners(): void {
    eventDispatcher.register<UserLoggedInEvent>("UserLoggedInEvent", async (event) => {
      await logActionUC.execute({
        action: "CREATE",
        entityName: "Auth",
        actorId: event.userId,
        details: `User logged in from IP: ${event.ipAddress || 'unknown'}`,
      }).catch(console.error);
    });

    eventDispatcher.register<UserLoggedOutEvent>("UserLoggedOutEvent", async (event) => {
      await logActionUC.execute({
        action: "UPDATE",
        entityName: "Auth",
        actorId: event.userId,
        details: `User logged out`,
      }).catch(console.error);
    });
  }
}

export const authAuditListener = new AuthAuditListener();
authAuditListener.registerListeners();
