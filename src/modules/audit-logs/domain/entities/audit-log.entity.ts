import { AuditActionValueObject } from "../value-objects/audit-action.value-object";

export type AuditLogAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "REGISTER" | "SYSTEM" | "SEND" | "READ" | "IMPERSONATE" | "ACCESS" | "PURGE";

export interface AuditLogProps {
  id: string;
  action: AuditLogAction;
  entityName: string;      // e.g., "User", "Product", "Setting"
  entityId?: string | null; // ID of the entity that was affected
  actorId: string | null;  // ID of the user who performed the action; null if the actor was deleted
  details: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: Date;
}

export type CreateAuditLogProps = Omit<AuditLogProps, "id" | "createdAt" | "entityId" | "ipAddress"> & {
  id?: string;
  createdAt?: Date;
  entityId?: string | null;
  ipAddress?: string | null;
};

/**
 * Audit logs are append-only: entities are either created fresh via `create()`
 * (which validates the action) or rehydrated from persistence via `reconstruct()`
 * (which trusts already-validated data). There is no mutation behavior.
 */
export class AuditLogEntity {
  private constructor(private readonly props: AuditLogProps) {}

  public static create(props: CreateAuditLogProps): AuditLogEntity {
    const action = AuditActionValueObject.create(props.action).getValue();

    return new AuditLogEntity({
      id: props.id ?? crypto.randomUUID(),
      action,
      entityName: props.entityName,
      entityId: props.entityId ?? null,
      actorId: props.actorId,
      details: props.details,
      ipAddress: props.ipAddress ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  public static reconstruct(raw: AuditLogProps): AuditLogEntity {
    return new AuditLogEntity(raw);
  }

  public get id(): string {
    return this.props.id;
  }

  public get action(): AuditLogAction {
    return this.props.action;
  }

  public get entityName(): string {
    return this.props.entityName;
  }

  public get entityId(): string | null {
    return this.props.entityId ?? null;
  }

  public get actorId(): string | null {
    return this.props.actorId;
  }

  public get details(): Record<string, unknown> {
    return this.props.details;
  }

  public get ipAddress(): string | null {
    return this.props.ipAddress ?? null;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public toJSON(): AuditLogProps {
    return { ...this.props };
  }
}
