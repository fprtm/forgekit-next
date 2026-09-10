import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";
import { SendNotificationCommand } from "@/modules/notifications/application/use-cases/send-notification/send-notification.command";
import { NotificationEntity, NotificationType } from "@/modules/notifications/domain/entities/notification.entity";
import { NotificationSentEvent } from "@/modules/notifications/domain/events/notification.events";

const MANDATORY_TYPES: NotificationType[] = ["system", "security"];

export class SendNotificationHandler {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly settingRepo: ISettingRepository
  ) {}

  async execute(command: SendNotificationCommand): Promise<NotificationEntity | null> {
    const notificationType = command.type ?? "general";

    // 1. Fetch Global Settings
    const globalChannelsSetting = await this.settingRepo.findByKey("notification_channels");
    const globalEmail = globalChannelsSetting?.value?.email !== false;
    const globalPush = globalChannelsSetting?.value?.push !== false;
    const globalWhatsapp = globalChannelsSetting?.value?.whatsapp !== false;

    // 2. Fetch User Preferences
    const userSetting = await this.notificationRepo.findSettingsByUserId(command.userId);
    const userEmail = userSetting?.email !== false;
    const userPush = userSetting?.push !== false;
    const userWhatsapp = userSetting?.whatsapp !== false;

    // 3. Check Module Subscription (skip check for mandatory types)
    if (!MANDATORY_TYPES.includes(notificationType)) {
      const subscribed = userSetting?.[notificationType];
      if (subscribed === false) {
        console.log(
          `Notification skipped for user ${command.userId}: type "${notificationType}" is disabled in user subscriptions.`
        );
        return null;
      }
    }

    // 4. Determine actual channels
    const channels: string[] = [];
    if (globalEmail && userEmail) channels.push("email");
    if (globalPush && userPush) channels.push("push");
    if (globalWhatsapp && userWhatsapp) channels.push("whatsapp");

    if (channels.length === 0) {
      console.log(`Notification skipped for user ${command.userId} because all channels are disabled.`);
      return null;
    }

    // 5. Save to Database
    const notification = await this.notificationRepo.create({
      userId: command.userId,
      title: command.title,
      message: command.message,
      type: notificationType,
      priority: command.priority ?? "medium",
      read: false,
      readAt: null,
    });

    // 6. Dispatch Event
    eventDispatcher.dispatch(
      new NotificationSentEvent(
        notification.id,
        notification.userId,
        notification.title,
        notification.message,
        notification.type,
        notification.priority,
        channels
      )
    );

    return notification;
  }
}
