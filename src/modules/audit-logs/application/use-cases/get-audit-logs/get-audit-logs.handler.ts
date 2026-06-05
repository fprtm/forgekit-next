import { IAuditLogRepository } from "../../../domain/repositories/audit-log-repository.interface";
import { GetAuditLogsCommand, getAuditLogsSchema } from "./get-audit-logs.command";
import { AuditLogEntity } from "../../../domain/entities/audit-log.entity";
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";

export class GetAuditLogsHandler {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(command: GetAuditLogsCommand, currentUserRole: string): Promise<{ data: AuditLogEntity[]; total: number }> {
    if (currentUserRole !== "super_admin") {
      throw new UnauthorizedException("Only super_admin can access audit logs");
    }

    const validatedData = getAuditLogsSchema.parse(command);

    const [logs, total] = await Promise.all([
      this.auditLogRepository.findMany(validatedData),
      this.auditLogRepository.count(validatedData),
    ]);

    return {
      data: logs,
      total,
    };
  }
}
