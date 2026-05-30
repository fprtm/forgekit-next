import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { NotificationRepository } from "@/modules/notifications/domain/repositories/notification.repository";
import { ISettingRepository } from "@/modules/setting/domain/repositories/setting-repository.interface";
import { SendNotificationCommand } from "@/modules/notifications/application/use-cases/send-notification/send-notification.command";
import { NotificationEntity } from "@/modules/notifications/domain/entities/notification.entity";
import { NotificationSentEvent } from "@/modules/notifications/domain/events/notification.events";

export class SendNotificationHandler {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly settingRepo: ISettingRepository
  ) {}

  async execute(command: SendNotificationCommand): Promise<NotificationEntity | null> {
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

    // 3. Determine actual channels
    const channels: string[] = [];
    if (globalEmail && userEmail) channels.push("email");
    if (globalPush && userPush) channels.push("push");
    if (globalWhatsapp && userWhatsapp) channels.push("whatsapp");

    // If no channels are active, we don't send or save
    if (channels.length === 0) {
      console.log(`Notification skipped for user ${command.userId} because all channels are disabled.`);
      return null;
    }

    // 4. Save to Database (In-App notifications always get saved if any channel is active)
    const notification = await this.notificationRepo.save({
      userId: command.userId,
      title: command.title,
      message: command.message,
      read: false,
    });

    // 5. Dispatch Event
    eventDispatcher.dispatch(
      new NotificationSentEvent(
        notification.id,
        notification.userId,
        notification.title,
        channels
      )
    );

    return notification;
  }
}
