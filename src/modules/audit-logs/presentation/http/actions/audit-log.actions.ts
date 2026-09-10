"use server";

import { auth } from "@/shared/lib/auth";
import { GetAuditLogsHandler } from "../../../application/use-cases/get-audit-logs/get-audit-logs.handler";
import { AuditLogEntity } from "../../../domain/entities/audit-log.entity";
import { GetAuditLogsCommand } from "../../../application/use-cases/get-audit-logs/get-audit-logs.command";
import { DrizzleAuditLogRepository } from "../../../infrastructure/database/repositories/drizzle-audit-log.repository";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { logger } from "@/shared/lib/logger";
import { toPlain } from "@/shared/domain/serialize";

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
    return { success: true, data: { data: toPlain(result.data), total: result.total }, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET AUDIT LOGS ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}
