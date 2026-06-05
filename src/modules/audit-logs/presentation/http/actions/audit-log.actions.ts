import { auth } from "@/shared/lib/auth";
import { logActionUC, logActivityUC } from "../../../application/use-cases/audit-uc";
import { GetAuditLogsHandler } from "../../../application/use-cases/get-audit-logs/get-audit-logs.handler";
import { AuditLogEntity } from "../../../domain/entities/audit-log.entity";
import { GetAuditLogsCommand } from "../../../application/use-cases/get-audit-logs/get-audit-logs.command";
import { DrizzleAuditLogRepository } from "../../../infrastructure/repositories/drizzle-impl/drizzle-audit-log.repository";

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const auditLogRepo = new DrizzleAuditLogRepository()
const getAuditLogsUC = new GetAuditLogsHandler(auditLogRepo)

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
