import {
  getNotificationsHandler,
  createNotificationHandler,
  deleteAllNotificationsHandler,
} from "@/modules/notifications/presentation/http/route-handlers"

export const GET = getNotificationsHandler
export const POST = createNotificationHandler
export const DELETE = deleteAllNotificationsHandler
