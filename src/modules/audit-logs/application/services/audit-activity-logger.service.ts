import { IAuditLogRepository } from "../../domain/repositories/audit-log-repository.interface";
import { LogActionHandler } from "../use-cases/log-action/log-action.handler";
import { AuditLogAction, AuditLogEntity } from "../../domain/entities/audit-log.entity";
import { logger } from "@/shared/lib/logger";

const ENTITY_ACTION_MAP: Record<string, { entity: string; actions: Record<string, AuditLogAction> }> = {
  product: {
    entity: "Product",
    actions: { create: "CREATE", update: "UPDATE", delete: "DELETE" },
  },
  user: {
    entity: "User",
    actions: {
      create: "CREATE", update: "UPDATE", delete: "DELETE",
      register: "CREATE", login: "LOGIN", logout: "LOGOUT",
    },
  },
  notification: {
    entity: "Notification",
    actions: { create: "CREATE", send: "SEND", read: "READ" },
  },
  setting: {
    entity: "Setting",
    actions: { update: "UPDATE", create: "CREATE" },
  },
  auth: {
    entity: "Auth",
    actions: { login: "LOGIN", logout: "LOGOUT", register: "CREATE", impersonate: "IMPERSONATE" },
  },
  audit: {
    entity: "Audit",
    actions: { access: "READ", purge: "DELETE" },
  },
};

/**
 * Encapsulates audit-log activity recording. Accepts the repository interface via
 * constructor so callers (composition roots) decide which concrete implementation to use.
 */
export class AuditActivityLogger {
  private readonly logActionUC: LogActionHandler;

  constructor(auditLogRepository: IAuditLogRepository) {
    this.logActionUC = new LogActionHandler(auditLogRepository);
  }

  async logActivity(params: {
    userId: string | null;
    action: string;
    details: string | Record<string, unknown>;
  }): Promise<AuditLogEntity | void> {
    let actionType: AuditLogAction = "SYSTEM";
    let entityName = "Unknown";

    for (const [key, mapping] of Object.entries(ENTITY_ACTION_MAP)) {
      if (params.action.includes(key)) {
        entityName = mapping.entity;
        for (const [verb, action] of Object.entries(mapping.actions)) {
          if (params.action.includes(verb)) {
            actionType = action;
            break;
          }
        }
        break;
      }
    }

    return this.logActionUC.execute({
      action: actionType,
      entityName,
      actorId: params.userId || "SYSTEM",
      details: params.details,
    }).catch((err) => logger.error({ err, params }, "logActivityUC failed"));
  }
}
