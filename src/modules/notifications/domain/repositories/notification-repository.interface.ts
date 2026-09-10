import { CreateNotificationInput, NotificationEntity, UserNotificationSettingsEntity } from "@/modules/notifications/domain/entities/notification.entity";

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface INotificationRepository {
  create(notification: CreateNotificationInput): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<NotificationEntity[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
  findSettingsByUserId(userId: string): Promise<UserNotificationSettingsEntity | null>;
  saveSettings(settings: Omit<UserNotificationSettingsEntity, "id" | "createdAt" | "updatedAt">): Promise<UserNotificationSettingsEntity>;
  updateSettings(userId: string, settings: Partial<Omit<UserNotificationSettingsEntity, "id" | "userId" | "createdAt" | "updatedAt">>): Promise<UserNotificationSettingsEntity>;
  getUnreadCount(userId: string): Promise<number>;
}
