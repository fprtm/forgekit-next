import { generateUniqueString } from "@/shared/lib/utils";
import type { NotificationType, NotificationPriority } from "../../domain/entities/notification.entity";

export interface NotificationFixture {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export function createNotificationFixture(
  prefix = "Notification",
  overrides?: Partial<NotificationFixture>
): NotificationFixture {
  const uniqueName = generateUniqueString(prefix);

  return {
    title: uniqueName,
    message: `This is a test message for ${uniqueName}. Generated via E2E test factory.`,
    type: overrides?.type ?? "general",
    priority: overrides?.priority ?? "medium",
    ...overrides,
  };
}

export interface NotificationSettingFixture {
  email: boolean;
  push: boolean;
  whatsapp: boolean;
  subscriptions: Record<NotificationType, boolean>;
}

export function createNotificationSettingFixture(
  overrides?: Partial<NotificationSettingFixture>
): NotificationSettingFixture {
  return {
    email: true,
    push: true,
    whatsapp: true,
    subscriptions: {
      system: true,
      security: true,
      marketing: true,
      product: true,
      general: true,
    },
    ...overrides,
  };
}

export function createSubscriptionPayload(
  overrides?: Partial<Record<NotificationType, boolean>>
): Record<string, boolean> {
  return {
    marketing: true,
    product: true,
    general: true,
    ...overrides,
  };
}
