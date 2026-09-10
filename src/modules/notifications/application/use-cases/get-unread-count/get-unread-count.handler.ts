import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { GetUnreadCountCommand } from "@/modules/notifications/application/use-cases/get-unread-count/get-unread-count.command";

export class GetUnreadCountHandler {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(command: GetUnreadCountCommand): Promise<number> {
    return this.notificationRepo.getUnreadCount(command.userId);
  }
}
