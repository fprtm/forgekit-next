import { db } from "@/db";
import { eq, and, desc, count } from "drizzle-orm";
import { IAuditLogRepository } from "@/modules/audit-logs/domain/repositories/audit-log-repository.interface";
import { AuditLogEntity, AuditLogAction, AuditLogProps } from "@/modules/audit-logs/domain/entities/audit-log.entity";
import { auditLogs } from "@/modules/audit-logs/infrastructure/database/drizzle/schema";

export class DrizzleAuditLogRepository implements IAuditLogRepository {
  async create(log: Omit<AuditLogProps, "id" | "createdAt">): Promise<AuditLogEntity> {
    const [createdLog] = await db
      .insert(auditLogs)
      .values({
        action: log.action,
        entityName: log.entityName,
        entityId: log.entityId,
        actorId: log.actorId,
        details: log.details,
        ipAddress: log.ipAddress,
      })
      .returning();

    return AuditLogEntity.reconstruct({
      ...createdLog,
      action: createdLog.action as AuditLogAction,
      details: createdLog.details as Record<string, unknown>,
    });
  }

  async findMany(options?: {
    limit?: number;
    offset?: number;
    actorId?: string;
    action?: string;
    entityName?: string;
  }): Promise<AuditLogEntity[]> {
    const conditions = [];

    if (options?.actorId) {
      conditions.push(eq(auditLogs.actorId, options.actorId));
    }
    if (options?.action) {
      conditions.push(eq(auditLogs.action, options.action));
    }
    if (options?.entityName) {
      conditions.push(eq(auditLogs.entityName, options.entityName));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db.query.auditLogs.findMany({
      where: whereClause,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
      orderBy: [desc(auditLogs.createdAt)],
    });

    return logs.map((log) =>
      AuditLogEntity.reconstruct({
        ...log,
        action: log.action as AuditLogAction,
        details: log.details as Record<string, unknown>,
      }),
    );
  }

  async findById(id: string): Promise<AuditLogEntity | null> {
    const [log] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1);

    if (!log) return null;

    return AuditLogEntity.reconstruct({
      ...log,
      action: log.action as AuditLogAction,
      details: log.details as Record<string, unknown>,
    });
  }

  async count(options?: {
    actorId?: string;
    action?: string;
    entityName?: string;
  }): Promise<number> {
    const conditions = [];

    if (options?.actorId) {
      conditions.push(eq(auditLogs.actorId, options.actorId));
    }
    if (options?.action) {
      conditions.push(eq(auditLogs.action, options.action));
    }
    if (options?.entityName) {
      conditions.push(eq(auditLogs.entityName, options.entityName));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [result] = await db
      .select({ value: count() })
      .from(auditLogs)
      .where(whereClause);

    return result.value;
  }
}
