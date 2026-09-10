import { DomainEvent } from "@/shared/domain/events/domain.event";
import { NotificationType, NotificationPriority } from "@/modules/notifications/domain/entities/notification.entity";

export class NotificationSentEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = "NotificationSentEvent";

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: NotificationType,
    public readonly priority: NotificationPriority,
    public readonly channelsUsed: string[]
  ) {
    this.occurredOn = new Date();
  }
}

export class AllNotificationsReadEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = "AllNotificationsReadEvent";

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}

export class NotificationSettingUpdatedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName = "NotificationSettingUpdatedEvent";

  constructor(public readonly userId: string) {
    this.occurredOn = new Date();
  }
}
