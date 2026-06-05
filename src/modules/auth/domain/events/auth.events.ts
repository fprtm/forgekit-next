import { DomainEvent } from "@/shared/domain/events/domain.event";

export class UserLoggedInEvent implements DomainEvent {
  public readonly eventName = "UserLoggedInEvent";
  public readonly occurredOn: Date;
  public readonly userId: string;
  public readonly ipAddress?: string;

  constructor(userId: string, ipAddress?: string) {
    this.occurredOn = new Date();
    this.userId = userId;
    this.ipAddress = ipAddress;
  }
}

export class UserLoggedOutEvent implements DomainEvent {
  public readonly eventName = "UserLoggedOutEvent";
  public readonly occurredOn: Date;
  public readonly userId: string;

  constructor(userId: string) {
    this.occurredOn = new Date();
    this.userId = userId;
  }
}
