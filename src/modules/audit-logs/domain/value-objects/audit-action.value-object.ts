import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import type { AuditLogAction } from "../entities/audit-log.entity";

export const VALID_AUDIT_ACTIONS = [
  "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REGISTER",
  "SYSTEM", "SEND", "READ", "IMPERSONATE", "ACCESS", "PURGE",
] as const satisfies readonly AuditLogAction[];

export class AuditActionValueObject {
  private readonly action: AuditLogAction;

  private constructor(action: AuditLogAction) {
    this.action = action;
  }

  public static create(action: string): AuditActionValueObject {
    if (!VALID_AUDIT_ACTIONS.includes(action as AuditLogAction)) {
      throw new DomainException(`Invalid audit action: ${action}`, "INVALID_AUDIT_ACTION", 400);
    }

    return new AuditActionValueObject(action as AuditLogAction);
  }

  public getValue(): AuditLogAction {
    return this.action;
  }
}
