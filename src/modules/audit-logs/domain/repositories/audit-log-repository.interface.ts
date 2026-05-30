import { AuditLogEntity } from "../entities/audit-log.entity";

export interface IAuditLogRepository {
  create(log: Omit<AuditLogEntity, "id" | "createdAt">): Promise<AuditLogEntity>;
  findMany(options?: {
    limit?: number;
    offset?: number;
    actorId?: string;
    action?: string;
    entityName?: string;
  }): Promise<AuditLogEntity[]>;
  findById(id: string): Promise<AuditLogEntity | null>;
  count(options?: {
    actorId?: string;
    action?: string;
    entityName?: string;
  }): Promise<number>;
}
