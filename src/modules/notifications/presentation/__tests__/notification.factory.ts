import { generateUniqueString } from "@/shared/lib/utils";

export interface NotificationFixture {
  title: string;
  message: string;
}

export function createNotificationFixture(prefix = "Notification"): NotificationFixture {
  const uniqueName = generateUniqueString(prefix);

  return {
    title: uniqueName,
    message: `This is a test message for ${uniqueName}. Generated via E2E test factory.`,
  };
}
