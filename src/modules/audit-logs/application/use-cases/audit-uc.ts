import { DrizzleAuditLogRepository } from "../../infrastructure/repositories/drizzle-impl/drizzle-audit-log.repository";
import { LogActionHandler } from "./log-action/log-action.handler";
import { AuditLogAction } from "../../domain/entities/audit-log.entity";

const auditLogRepo = new DrizzleAuditLogRepository();

export const logActionUC = new LogActionHandler(auditLogRepo);

export const logActivityUC = {
  execute: async (params: { userId: string | null; action: string; details: any }) => {
    let actionType: AuditLogAction = "SYSTEM";
    let entityName = "Unknown";

    if (params.action.includes("product")) {
      entityName = "Product";
      if (params.action.includes("create")) actionType = "CREATE";
      if (params.action.includes("update")) actionType = "UPDATE";
      if (params.action.includes("delete")) actionType = "DELETE";
    }

    return logActionUC.execute({
      action: actionType,
      entityName,
      actorId: params.userId || "SYSTEM",
      details: params.details,
    }).catch(console.error);
  }
};
