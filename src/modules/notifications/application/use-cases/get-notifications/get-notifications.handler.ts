import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { GetNotificationsCommand } from "@/modules/notifications/application/use-cases/get-notifications/get-notifications.command";
import { NotificationEntity } from "@/modules/notifications/domain/entities/notification.entity";

export class GetNotificationsHandler {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(command: GetNotificationsCommand): Promise<NotificationEntity[]> {
    return this.notificationRepo.findByUserId(command.userId, {
      limit: command.limit,
      offset: command.offset,
    });
  }
}
