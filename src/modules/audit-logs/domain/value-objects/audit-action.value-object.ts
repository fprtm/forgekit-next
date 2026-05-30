import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export const VALID_AUDIT_ACTIONS = [
  "user:create", "user:update", "user:delete", "user:register",
  "product:create", "product:update", "product:delete",
  "setting:update", "auth:login", "auth:logout"
] as const;

export type AuditActionType = typeof VALID_AUDIT_ACTIONS[number];

export class AuditActionValueObject {
  private readonly action: string;

  private constructor(action: string) {
    this.action = action;
  }

  public static create(action: string): AuditActionValueObject {
    if (!VALID_AUDIT_ACTIONS.includes(action as AuditActionType)) {
      throw new DomainException(`Invalid audit action: ${action}`, "INVALID_AUDIT_ACTION", 400);
    }

    return new AuditActionValueObject(action);
  }

  public getValue(): string {
    return this.action;
  }
}
