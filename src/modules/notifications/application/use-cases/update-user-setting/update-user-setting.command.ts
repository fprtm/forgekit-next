import type { NotificationType } from "@/modules/notifications/domain/entities/notification.entity";

export interface UpdateUserSettingCommand {
  userId: string;
  email?: boolean;
  push?: boolean;
  whatsapp?: boolean;
  subscriptions?: Partial<Record<NotificationType, boolean>>;
}
