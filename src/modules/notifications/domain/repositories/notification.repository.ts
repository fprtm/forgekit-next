import { NotificationEntity, UserNotificationSettingsEntity } from "@/modules/notifications/domain/entities/notification.entity";

export interface NotificationRepository {
  save(notification: Omit<NotificationEntity, "id" | "createdAt" | "updatedAt">): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  findByUserId(userId: string): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<void>;
  
  findSettingsByUserId(userId: string): Promise<UserNotificationSettingsEntity | null>;
  saveSettings(settings: Omit<UserNotificationSettingsEntity, "id" | "createdAt" | "updatedAt">): Promise<UserNotificationSettingsEntity>;
  updateSettings(userId: string, settings: Partial<Omit<UserNotificationSettingsEntity, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<UserNotificationSettingsEntity>;
}
