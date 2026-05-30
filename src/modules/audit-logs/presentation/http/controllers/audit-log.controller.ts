import { NextRequest, NextResponse } from "next/server";
import { GetAuditLogsHandler } from "@/modules/audit-logs/application/use-cases/get-audit-logs/get-audit-logs.handler";
import { DrizzleAuditLogRepository } from "@/modules/audit-logs/infrastructure/repositories/drizzle-impl/drizzle-audit-log.repository";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { auth } from "@/shared/lib/auth";

const auditRepo = new DrizzleAuditLogRepository();
const getAuditLogsUC = new GetAuditLogsHandler(auditRepo);

export class AuditLogController {
  /**
   * REST API Controller for fetching audit logs securely.
   */
  public async getLogs(req: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth();

      const searchParams = req.nextUrl.searchParams;
      const limit = parseInt(searchParams.get('limit') || "50", 10);

      const result = await getAuditLogsUC.execute(
        { limit },
        session?.user?.role || ""
      );

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }

      console.error("AUDIT_CONTROLLER_GET_LOGS_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const auditLogController = new AuditLogController();
