import { DomainEvent } from "@/shared/domain/events/domain.event";

export class UserImpersonatedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = "UserImpersonatedEvent";

  constructor(
    public readonly superAdminId: string,
    public readonly targetUserId: string
  ) {
    this.occurredOn = new Date();
  }
}

export class UserImpersonationStoppedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = "UserImpersonationStoppedEvent";

  constructor(
    public readonly superAdminId: string,
    public readonly targetUserId: string
  ) {
    this.occurredOn = new Date();
  }
}
