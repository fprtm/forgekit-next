export type AuditLogAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "REGISTER" | "SYSTEM" | "SEND" | "READ" | "IMPERSONATE" | "ACCESS" | "PURGE";

export interface AuditLogEntity {
  id: string;
  action: AuditLogAction;
  entityName: string;      // e.g., "User", "Product", "Setting"
  entityId?: string | null; // ID of the entity that was affected
  actorId: string;         // ID of the user who performed the action, or "SYSTEM"
  details: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: Date;
}
