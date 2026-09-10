import { NextRequest } from "next/server"
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response"
import { auth } from "@/shared/lib/auth"
import { DrizzleNotificationRepository } from "../../infrastructure/database/repositories/drizzle-notification.repository"
import { DrizzleSettingRepository } from "@/modules/setting/infrastructure/database/repositories/drizzle-setting.repository"
import { GetNotificationsHandler } from "../../application/use-cases/get-notifications/get-notifications.handler"
import { GetUnreadCountHandler } from "../../application/use-cases/get-unread-count/get-unread-count.handler"
import { MarkAllNotificationsReadHandler } from "../../application/use-cases/mark-all-notifications-read/mark-all-notifications-read.handler"
import { UpdateUserSettingHandler } from "../../application/use-cases/update-user-setting/update-user-setting.handler"
import { SendNotificationHandler } from "../../application/use-cases/send-notification/send-notification.handler"
import { NotificationNotFoundException } from "../../domain/exceptions/notification.exceptions"
import { sendNotificationSchema, updateNotificationSettingsSchema } from "../../application/validations"

const notificationRepo = new DrizzleNotificationRepository()
const settingRepo = new DrizzleSettingRepository()
const getNotificationsUC = new GetNotificationsHandler(notificationRepo)
const getUnreadCountUC = new GetUnreadCountHandler(notificationRepo)
const markAllReadUC = new MarkAllNotificationsReadHandler(notificationRepo)
const updateUserSettingUC = new UpdateUserSettingHandler(notificationRepo)
const sendNotificationUC = new SendNotificationHandler(notificationRepo, settingRepo)

export async function getNotificationsHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? 20)
    const offset = Number(searchParams.get("offset") ?? 0)

    const data = await getNotificationsUC.execute({ userId: session.user.id, limit: limit + 1, offset })
    return apiSuccess(data)
  } catch (error: unknown) {
    return handleApiError(error, "GET_NOTIFICATIONS")
  }
}

export async function createNotificationHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()
    const parsed = sendNotificationSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((issue) => issue.message).join(", "), 400)
    }

    const notification = await sendNotificationUC.execute({
      userId: session.user.id,
      title: parsed.data.title,
      message: parsed.data.message,
      type: parsed.data.type ?? "general",
      priority: parsed.data.priority ?? "medium",
    })

    if (!notification) {
      return apiSuccess({ skipped: true, reason: "Notification blocked by user preferences or channels" }, 200)
    }

    return apiSuccess(notification, 201)
  } catch (error: unknown) {
    return handleApiError(error, "CREATE_NOTIFICATION")
  }
}

export async function getUnreadCountHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const count = await getUnreadCountUC.execute({ userId: session.user.id })
    return apiSuccess({ unreadCount: count })
  } catch (error: unknown) {
    return handleApiError(error, "GET_UNREAD_COUNT")
  }
}

export async function markAsReadHandler(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const { id } = await props.params
    const notification = await notificationRepo.findById(id)
    if (!notification || notification.userId !== session.user.id) {
      throw new NotificationNotFoundException()
    }

    await notificationRepo.markAsRead(id)
    return apiSuccess({ success: true })
  } catch (error: unknown) {
    return handleApiError(error, "MARK_AS_READ")
  }
}

export async function markAllAsReadHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    await markAllReadUC.execute({ userId: session.user.id })
    return apiSuccess({ success: true })
  } catch (error: unknown) {
    return handleApiError(error, "MARK_ALL_READ")
  }
}

export async function getSettingsHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const settings = await notificationRepo.findSettingsByUserId(session.user.id)
    return apiSuccess(settings || { email: true, push: true, whatsapp: true, system: true, security: true, marketing: true, product: true, general: true })
  } catch (error: unknown) {
    return handleApiError(error, "GET_SETTINGS")
  }
}

export async function updateSettingsHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()
    const parsed = updateNotificationSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((issue) => issue.message).join(", "), 400)
    }

    const settings = await updateUserSettingUC.execute({
      userId: session.user.id,
      email: parsed.data.email,
      push: parsed.data.push,
      whatsapp: parsed.data.whatsapp,
      subscriptions: parsed.data.subscriptions,
    })

    return apiSuccess(settings)
  } catch (error: unknown) {
    return handleApiError(error, "UPDATE_SETTINGS")
  }
}

export async function deleteAllNotificationsHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    await notificationRepo.deleteAllByUserId(session.user.id)
    return apiSuccess({ success: true })
  } catch (error: unknown) {
    return handleApiError(error, "DELETE_ALL_NOTIFICATIONS")
  }
}
