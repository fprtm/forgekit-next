import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { UserLoggedInEvent } from "@/modules/auth/domain/events/auth.events";
import { SendNotificationHandler } from "@/modules/notifications/application/use-cases/send-notification/send-notification.handler";
import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";

export class NotificationListener {
  private readonly sendNotificationUC: SendNotificationHandler;

  constructor(notificationRepo: INotificationRepository, settingRepo: ISettingRepository) {
    this.sendNotificationUC = new SendNotificationHandler(notificationRepo, settingRepo);
  }

  public registerListeners(): void {
    // Listen to UserLoggedInEvent to send a login alert notification
    eventDispatcher.register<UserLoggedInEvent>("UserLoggedInEvent", async (event) => {
      await this.sendNotificationUC.execute({
        userId: event.userId,
        title: "Security Alert: New Login",
        message: `Your account was successfully logged in from IP address: ${event.ipAddress || 'unknown'}. If this wasn't you, please change your password immediately.`,
        type: "security",
        priority: "high",
      }).catch(console.error);
    });
  }
}
