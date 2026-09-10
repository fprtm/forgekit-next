import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { UserPasswordResetEvent } from "@/modules/users/domain/events/user.events";
import { SendNotificationHandler } from "@/modules/notifications/application/use-cases/send-notification/send-notification.handler";
import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";
import { logger } from "@/shared/lib/logger";

/**
 * Reacts to UserPasswordResetEvent (previously orphaned — dispatched with zero
 * listeners). Logs the reset for observability and sends the affected user a
 * security notification through their configured channels.
 */
export class PasswordResetNotificationListener {
  private readonly sendNotificationUC: SendNotificationHandler;

  constructor(notificationRepo: INotificationRepository, settingRepo: ISettingRepository) {
    this.sendNotificationUC = new SendNotificationHandler(notificationRepo, settingRepo);
  }

  public registerListeners(): void {
    eventDispatcher.register<UserPasswordResetEvent>("UserPasswordResetEvent", async (event) => {
      logger.info(
        { userId: event.user.id, adminId: event.adminId },
        "Password reset performed — notifying user"
      );

      const isAdminInitiated = Boolean(event.adminId && event.adminId !== event.user.id);

      await this.sendNotificationUC
        .execute({
          userId: event.user.id,
          title: "Security Alert: Your password was reset",
          message: isAdminInitiated
            ? "An administrator reset your account password. If you did not request this, contact support immediately."
            : "Your account password was reset. If you did not request this, contact support immediately.",
          type: "security",
          priority: "high",
        })
        .catch((err) =>
          logger.error({ err, userId: event.user.id }, "Failed to send password reset notification")
        );
    });
  }
}
