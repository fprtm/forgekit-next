import { NotificationRepository } from "@/modules/notifications/domain/repositories/notification.repository";
import { MarkAllNotificationsReadCommand } from "@/modules/notifications/application/use-cases/mark-all-notifications-read/mark-all-notifications-read.command";

export class MarkAllNotificationsReadHandler {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(command: MarkAllNotificationsReadCommand): Promise<void> {
    await this.notificationRepo.markAllAsRead(command.userId);
  }
}
