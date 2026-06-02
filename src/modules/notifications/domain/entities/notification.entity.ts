export type NotificationType = "system" | "security" | "marketing" | "product" | "general";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserNotificationSettingsEntity {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  system: boolean;
  security: boolean;
  marketing: boolean;
  product: boolean;
  general: boolean;
  createdAt: Date;
  updatedAt: Date;
}
