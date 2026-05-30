"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleAuditLogRepository } from "../../../infrastructure/repositories/drizzle-impl/drizzle-audit-log.repository"
import { LogActionHandler } from "../../../application/use-cases/log-action/log-action.handler"
import { GetAuditLogsHandler } from "../../../application/use-cases/get-audit-logs/get-audit-logs.handler"
import { AuditLogEntity, AuditLogAction } from "../../../domain/entities/audit-log.entity"
import { GetAuditLogsCommand } from "../../../application/use-cases/get-audit-logs/get-audit-logs.command"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const auditLogRepo = new DrizzleAuditLogRepository()
export const logActionUC = new LogActionHandler(auditLogRepo)
const getAuditLogsUC = new GetAuditLogsHandler(auditLogRepo)

// Backward compatibility for existing code that uses `logActivityUC`
export const logActivityUC = {
  execute: async (params: { userId: string | null; action: string; details: any }) => {
    // Map old format to new format
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
    }).catch(console.error); // Do not throw on audit failure
  }
}

export async function getAuditLogsAction(
  input: GetAuditLogsCommand,
): Promise<ActionResult<{ data: AuditLogEntity[]; total: number }>> {
  const session = await auth()
  
  if (!session?.user?.role) {
     return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const result = await getAuditLogsUC.execute(input, session.user.role)
    return { success: true, data: result, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}
