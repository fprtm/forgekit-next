import { IStatReader } from "../../domain/repositories/stat-reader.interface";
import { db } from "@/db";
import { users } from "../../../users/infrastructure/database/drizzle/schema";
import { products } from "../../../products/infrastructure/database/drizzle/schema";
import { auditLogs } from "../../../audit-logs/infrastructure/database/drizzle/schema";
import { count, desc } from "drizzle-orm";

export class DrizzleStatReader implements IStatReader {
  async countUsers(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(users);
    return result.value;
  }

  async countProducts(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(products);
    return result.value;
  }

  async countLogs(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(auditLogs);
    return result.value;
  }

  async getRecentLogs(limit: number): Promise<Array<{ action: string; entityName: string; createdAt: Date }>> {
    const logs = await db
      .select({ action: auditLogs.action, entityName: auditLogs.entityName, createdAt: auditLogs.createdAt })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
    return logs;
  }
}
