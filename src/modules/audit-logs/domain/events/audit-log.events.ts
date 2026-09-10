import { DomainEvent } from "@/shared/domain/events/domain.event";
import { AuditLogEntity } from "../entities/audit-log.entity";

/**
 * Fired after an audit log entry has been persisted. The write itself is the
 * side effect of whatever domain action triggered it — this event exists for
 * downstream observers (e.g. real-time audit feeds) that want to react to new
 * entries without querying the repository, not to trigger further audit writes.
 */
export class AuditLogEntryCreatedEvent implements DomainEvent {
  public readonly eventName = "AuditLogEntryCreatedEvent";
  public readonly occurredOn: Date;
  public readonly log: AuditLogEntity;

  constructor(log: AuditLogEntity) {
    this.occurredOn = new Date();
    this.log = log;
  }
}
