import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { MarkAllNotificationsReadCommand } from "@/modules/notifications/application/use-cases/mark-all-notifications-read/mark-all-notifications-read.command";
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { AllNotificationsReadEvent } from "@/modules/notifications/domain/events/notification.events";

export class MarkAllNotificationsReadHandler {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
    await this.notificationRepo.markAllAsRead(command.userId);

    await eventDispatcher.dispatch(new AllNotificationsReadEvent(command.userId));
  }
}
