import { NotificationRepository } from "@/modules/notifications/domain/repositories/notification.repository";
import { GetUnreadCountCommand } from "@/modules/notifications/application/use-cases/get-unread-count/get-unread-count.command";

export class GetUnreadCountHandler {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(command: GetUnreadCountCommand): Promise<number> {
    const notifications = await this.notificationRepo.findByUserId(command.userId);
    return notifications.filter((n) => !n.read).length;
  }
}
