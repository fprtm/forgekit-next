import { NotificationRepository } from "@/modules/notifications/domain/repositories/notification.repository";
import { UpdateUserSettingCommand } from "@/modules/notifications/application/use-cases/update-user-setting/update-user-setting.command";
import { UserNotificationSettingsEntity } from "@/modules/notifications/domain/entities/notification.entity";

export class UpdateUserSettingHandler {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async execute(command: UpdateUserSettingCommand): Promise<UserNotificationSettingsEntity> {
    const existing = await this.notificationRepo.findSettingsByUserId(command.userId);

    if (!existing) {
      return this.notificationRepo.saveSettings({
        userId: command.userId,
        email: command.email !== false,
        push: command.push !== false,
        whatsapp: command.whatsapp !== false,
      });
    }

    return this.notificationRepo.updateSettings(command.userId, {
      ...(command.email !== undefined && { email: command.email }),
      ...(command.push !== undefined && { push: command.push }),
      ...(command.whatsapp !== undefined && { whatsapp: command.whatsapp }),
    });
  }
}
