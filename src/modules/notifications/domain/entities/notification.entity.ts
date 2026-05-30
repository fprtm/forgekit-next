export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserNotificationSettingsEntity {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  createdAt: Date;
  updatedAt: Date;
}
