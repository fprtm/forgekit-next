import { NotificationType, NotificationPriority } from "@/modules/notifications/domain/entities/notification.entity";

export interface SendNotificationCommand {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
}
