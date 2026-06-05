"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleNotificationRepository } from "../../../infrastructure/database/repositories/drizzle-notification.repository"
import { GetNotificationsHandler } from "../../../application/use-cases/get-notifications/get-notifications.handler"
import { GetUnreadCountHandler } from "../../../application/use-cases/get-unread-count/get-unread-count.handler"
import { MarkAllNotificationsReadHandler } from "../../../application/use-cases/mark-all-notifications-read/mark-all-notifications-read.handler"
import { UpdateUserSettingHandler } from "../../../application/use-cases/update-user-setting/update-user-setting.handler"
import { NotificationEntity, UserNotificationSettingsEntity, NotificationType } from "../../../domain/entities/notification.entity"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const notificationRepo = new DrizzleNotificationRepository()
const getNotificationsUC = new GetNotificationsHandler(notificationRepo)
const getUnreadCountUC = new GetUnreadCountHandler(notificationRepo)
const markAllReadUC = new MarkAllNotificationsReadHandler(notificationRepo)
const updateUserSettingUC = new UpdateUserSettingHandler(notificationRepo)

export async function getNotificationsAction(limit = 20, offset = 0): Promise<ActionResult<NotificationEntity[]>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null }

  try {
    const data = await getNotificationsUC.execute({ userId: session.user.id, limit: limit + 1, offset })
    return { success: true, data, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("GET NOTIFICATIONS ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function markAsReadAction(id: string): Promise<ActionResult<null>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null }

  try {
    await notificationRepo.markAsRead(id)
    return { success: true, data: null, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("MARK AS READ ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function markAllAsReadAction(): Promise<ActionResult<null>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null }

  try {
    await markAllReadUC.execute({ userId: session.user.id })
    return { success: true, data: null, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("MARK ALL AS READ ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null }

  try {
    const count = await getUnreadCountUC.execute({ userId: session.user.id })
    return { success: true, data: count, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("GET UNREAD COUNT ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getNotificationSettingsAction(): Promise<ActionResult<UserNotificationSettingsEntity>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null }

  try {
    const settings = await notificationRepo.findSettingsByUserId(session.user.id)
    return {
      success: true,
      data: settings
        ? settings
        : { id: "", userId: "", email: true, push: true, whatsapp: true, system: true, security: true, marketing: true, product: true, general: true, createdAt: new Date(), updatedAt: new Date() },
      error: null,
    }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("GET NOTIFICATION SETTINGS ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function updateNotificationSettingsAction(
  settings: { email?: boolean; push?: boolean; whatsapp?: boolean; subscriptions?: Partial<Record<NotificationType, boolean>> }
): Promise<ActionResult<UserNotificationSettingsEntity>> {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized", data: null }

  try {
    const result = await updateUserSettingUC.execute({
      userId: session.user.id,
      ...settings,
    })
    return {
      success: true,
      data: result,
      error: null,
    }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    console.error("UPDATE NOTIFICATION SETTINGS ERROR:", error)
    return { success: false, error: "Internal Server Error", data: null }
  }
}
