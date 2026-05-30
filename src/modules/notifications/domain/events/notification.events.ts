import { DomainEvent } from "@/shared/domain/events/domain.event";

export class NotificationSentEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = "NotificationSentEvent";

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly channelsUsed: string[]
  ) {
    this.occurredOn = new Date();
  }
}
