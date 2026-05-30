import { IAuditLogRepository } from "../../../domain/repositories/audit-log-repository.interface";
import { GetAuditLogsCommand, getAuditLogsSchema } from "./get-audit-logs.command";
import { AuditLogEntity } from "../../../domain/entities/audit-log.entity";

export class GetAuditLogsHandler {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(command: GetAuditLogsCommand, currentUserRole: string): Promise<{ data: AuditLogEntity[]; total: number }> {
    // DevSecOps Guard: Only super_admin can read audit logs
    if (currentUserRole !== "super_admin") {
      throw new Error("Unauthorized: Only super_admin can access audit logs");
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
