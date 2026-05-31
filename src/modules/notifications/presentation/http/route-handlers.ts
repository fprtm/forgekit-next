import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/shared/lib/api-response"
import { auth } from "@/shared/lib/auth"
import { DrizzleNotificationRepository } from "../../infrastructure/database/repositories/drizzle-notification.repository"
import { GetNotificationsHandler } from "../../application/use-cases/get-notifications/get-notifications.handler"
import { GetUnreadCountHandler } from "../../application/use-cases/get-unread-count/get-unread-count.handler"
import { MarkAllNotificationsReadHandler } from "../../application/use-cases/mark-all-notifications-read/mark-all-notifications-read.handler"
import { UpdateUserSettingHandler } from "../../application/use-cases/update-user-setting/update-user-setting.handler"

const notificationRepo = new DrizzleNotificationRepository()
const getNotificationsUC = new GetNotificationsHandler(notificationRepo)
const getUnreadCountUC = new GetUnreadCountHandler(notificationRepo)
const markAllReadUC = new MarkAllNotificationsReadHandler(notificationRepo)
const updateUserSettingUC = new UpdateUserSettingHandler(notificationRepo)

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
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}

export async function createNotificationHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()
    const notification = await notificationRepo.save({
      userId: session.user.id,
      title: body.title,
      message: body.message,
      read: false,
    })

    return apiSuccess(notification, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 400)
  }
}

export async function getUnreadCountHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const count = await getUnreadCountUC.execute({ userId: session.user.id })
    return apiSuccess({ unreadCount: count })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}

export async function markAsReadHandler(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const { id } = await props.params
    await notificationRepo.markAsRead(id)
    return apiSuccess({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}

export async function markAllAsReadHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    await markAllReadUC.execute({ userId: session.user.id })
    return apiSuccess({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}

export async function getSettingsHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const settings = await notificationRepo.findSettingsByUserId(session.user.id)
    return apiSuccess(settings || { email: true, push: true, whatsapp: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}

export async function updateSettingsHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()
    const settings = await updateUserSettingUC.execute({
      userId: session.user.id,
      email: body.email,
      push: body.push,
      whatsapp: body.whatsapp,
    })

    return apiSuccess(settings)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 400)
  }
}

export async function deleteAllNotificationsHandler(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    await notificationRepo.deleteAllByUserId(session.user.id)
    return apiSuccess({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}
