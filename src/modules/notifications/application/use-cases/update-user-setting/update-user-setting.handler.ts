import { INotificationRepository } from "@/modules/notifications/domain/repositories/notification-repository.interface";
import { UpdateUserSettingCommand } from "@/modules/notifications/application/use-cases/update-user-setting/update-user-setting.command";
import { UserNotificationSettingsEntity, NotificationType } from "@/modules/notifications/domain/entities/notification.entity";
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { NotificationSettingUpdatedEvent } from "@/modules/notifications/domain/events/notification.events";

const MANDATORY_TYPES: NotificationType[] = ["system", "security"];

function applySubscriptions(
  existing: UserNotificationSettingsEntity,
  subscriptions?: Partial<Record<NotificationType, boolean>>
): Partial<Record<NotificationType, boolean>> {
  const update: Partial<Record<NotificationType, boolean>> = {};
  if (subscriptions) {
    for (const [type, enabled] of Object.entries(subscriptions)) {
      if (MANDATORY_TYPES.includes(type as NotificationType)) continue;
      if (enabled !== undefined) {
        update[type as NotificationType] = enabled;
      }
    }
  }
  return update;
}

export class UpdateUserSettingHandler {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  async execute(command: UpdateUserSettingCommand): Promise<UserNotificationSettingsEntity> {
    const existing = await this.notificationRepo.findSettingsByUserId(command.userId);

    let result: UserNotificationSettingsEntity;

    if (!existing) {
      const subUpdate = command.subscriptions ?? {};
      result = await this.notificationRepo.saveSettings({
        userId: command.userId,
        email: command.email !== false,
        push: command.push !== false,
        whatsapp: command.whatsapp !== false,
        system: true,
        security: true,
        marketing: subUpdate.marketing ?? true,
        product: subUpdate.product ?? true,
        general: subUpdate.general ?? true,
      });
    } else {
      result = await this.notificationRepo.updateSettings(command.userId, {
        ...(command.email !== undefined && { email: command.email }),
        ...(command.push !== undefined && { push: command.push }),
        ...(command.whatsapp !== undefined && { whatsapp: command.whatsapp }),
        ...applySubscriptions(existing, command.subscriptions),
      });
    }

    await eventDispatcher.dispatch(new NotificationSettingUpdatedEvent(command.userId));

    return result;
  }
}
