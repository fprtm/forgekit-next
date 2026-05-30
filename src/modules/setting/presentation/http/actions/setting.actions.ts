"use server"

import { auth } from "@/shared/lib/auth"
import { can } from "@/modules/auth/domain/policies"
import { DrizzleSettingRepository } from "../../../infrastructure/database/repositories/drizzle-setting.repository"
import { GetSettingHandler } from "../../../application/use-cases/get-setting/get-setting.handler"
import { UpdateSettingHandler } from "../../../application/use-cases/update-setting/update-setting.handler"
import { Setting, SettingCategory, SettingKey, SettingsValueMap } from "../../../domain/entities/setting.entity"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const settingRepo = new DrizzleSettingRepository()
const getSettingUC = new GetSettingHandler(settingRepo)
const updateSettingUC = new UpdateSettingHandler(settingRepo)

export async function getSettingAction<K extends SettingKey>(key: K): Promise<ActionResult<SettingsValueMap[K] | null>> {
  try {
    const data = await getSettingUC.execute({ key })
    return { success: true, data: data?.value as SettingsValueMap[K] || null, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getSettingsAction(): Promise<ActionResult<Setting[]>> {
  const session = await auth()

  if (!session?.user || !can(session.user, "settings:read")) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const settings = await settingRepo.findAll()
    return { success: true, data: settings, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
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
    const settings = await settingRepo.findByCategory(category)
    return { success: true, data: settings, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
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
    const result = await settingRepo.upsert(key, value)
    return { success: true, data: result, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
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
    const deleted = await settingRepo.delete(key)
    return { success: true, data: deleted, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}
