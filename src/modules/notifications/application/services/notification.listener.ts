import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { UserLoggedInEvent } from "@/modules/auth/domain/events/auth.events";
import { SendNotificationHandler } from "@/modules/notifications/application/use-cases/send-notification/send-notification.handler";
import { DrizzleNotificationRepository } from "@/modules/notifications/infrastructure/database/repositories/drizzle-notification.repository";
import { DrizzleSettingRepository } from "@/modules/setting/infrastructure/database/repositories/drizzle-setting.repository";

const notificationRepo = new DrizzleNotificationRepository();
const settingRepo = new DrizzleSettingRepository();
const sendNotificationUC = new SendNotificationHandler(notificationRepo, settingRepo);

export class NotificationListener {
  public registerListeners(): void {
    // Listen to UserLoggedInEvent to send a login alert notification
    eventDispatcher.register<UserLoggedInEvent>("UserLoggedInEvent", async (event) => {
      await sendNotificationUC.execute({
        userId: event.userId,
        title: "Security Alert: New Login",
        message: `Your account was successfully logged in from IP address: ${event.ipAddress || 'unknown'}. If this wasn't you, please change your password immediately.`,
        type: "security",
        priority: "high",
      }).catch(console.error);
    });
  }
}

export const notificationListener = new NotificationListener();
notificationListener.registerListeners();
