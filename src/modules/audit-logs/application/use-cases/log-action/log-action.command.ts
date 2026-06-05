import { z } from "zod";
import type { AuditLogAction } from "../../../domain/entities/audit-log.entity";

const AUDIT_LOG_ACTIONS = [
  "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REGISTER",
  "SYSTEM", "SEND", "READ", "IMPERSONATE", "ACCESS", "PURGE",
] as const satisfies readonly AuditLogAction[];

export const logActionSchema = z.object({
  action: z.enum(AUDIT_LOG_ACTIONS),
  entityName: z.string().min(1),
  entityId: z.string().optional().nullable(),
  actorId: z.string().min(1),
  details: z.any().optional(),
  ipAddress: z.string().optional().nullable(),
});

export type LogActionCommand = z.infer<typeof logActionSchema>;
