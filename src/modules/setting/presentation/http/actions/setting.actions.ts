"use server"

import { auth } from "@/shared/lib/auth"
import { can } from "@/modules/auth/domain/policies"
import { DrizzleSettingRepository } from "../../../infrastructure/database/repositories/drizzle-setting.repository"
import { GetSettingHandler } from "../../../application/use-cases/get-setting/get-setting.handler"
import { GetAllSettingsHandler } from "../../../application/use-cases/get-all-settings/get-all-settings.handler"
import { GetSettingsByCategoryHandler } from "../../../application/use-cases/get-settings-by-category/get-settings-by-category.handler"
import { UpdateSettingHandler } from "../../../application/use-cases/update-setting/update-setting.handler"
import { DeleteSettingHandler } from "../../../application/use-cases/delete-setting/delete-setting.handler"
import { Setting, SettingCategory, SettingKey, SettingsValueMap } from "../../../domain/entities/setting.entity"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"
import { logger } from "@/shared/lib/logger"
import { toPlain } from "@/shared/domain/serialize"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const settingRepo = new DrizzleSettingRepository()
const getSettingUC = new GetSettingHandler(settingRepo)
const getAllSettingsUC = new GetAllSettingsHandler(settingRepo)
const getSettingsByCategoryUC = new GetSettingsByCategoryHandler(settingRepo)
const updateSettingUC = new UpdateSettingHandler(settingRepo)
const deleteSettingUC = new DeleteSettingHandler(settingRepo)

export async function getSettingAction<K extends SettingKey>(key: K): Promise<ActionResult<SettingsValueMap[K] | null>> {
  const session = await auth()

  if (!session?.user || !can(session.user, "settings:read")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const data = await getSettingUC.execute({ key })
    return { success: true, data: data?.value as SettingsValueMap[K] || null, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET SETTING ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getSettingsAction(): Promise<ActionResult<Setting[]>> {
  const session = await auth()

  if (!session?.user || !can(session.user, "settings:read")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const settings = await getAllSettingsUC.execute({ user: session.user })
    return { success: true, data: toPlain(settings), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET SETTINGS ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getSettingsByCategoryAction(
  category: SettingCategory
): Promise<ActionResult<Setting[]>> {
  const session = await auth()

  if (!session?.user || !can(session.user, "settings:read")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const settings = await getSettingsByCategoryUC.execute({ category, user: session.user })
    return { success: true, data: toPlain(settings), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET SETTINGS BY CATEGORY ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function updateSettingAction<K extends SettingKey>(
  key: K,
  value: SettingsValueMap[K]
): Promise<ActionResult<Setting<K>>> {
  const session = await auth()

  if (!session?.user || !can(session.user, "settings:write")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const result = await updateSettingUC.execute({ key, value, user: session.user })
    return { success: true, data: toPlain(result), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "UPDATE SETTING ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function deleteSettingAction(
  key: SettingKey
): Promise<ActionResult<Setting | undefined>> {
  const session = await auth()

  if (!session?.user || !can(session.user, "settings:write")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const deleted = await deleteSettingUC.execute({ key, user: session.user })
    return { success: true, data: toPlain(deleted), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "DELETE SETTING ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}
