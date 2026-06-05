import { DomainEvent } from "@/shared/domain/events/domain.event";
import { AuditLogEntity } from "../entities/audit-log.entity";

export class AuditLogCreatedEvent implements DomainEvent {
  public readonly eventName = "AuditLogCreatedEvent";
  public readonly occurredOn: Date;
  public readonly log: AuditLogEntity;

  constructor(log: AuditLogEntity) {
    this.occurredOn = new Date();
    this.log = log;
  }
}
