"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleSettingRepository } from "../../../infrastructure/database/repositories/drizzle-setting.repository"
import { GetSettingHandler } from "../../../application/use-cases/get-setting/get-setting.handler"
import { UpdateSettingHandler } from "../../../application/use-cases/update-setting/update-setting.handler"
import { SettingKey, SettingsValueMap } from "../../../domain/entities/setting.entity"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const settingRepo = new DrizzleSettingRepository()
const getSettingUC = new GetSettingHandler(settingRepo)
const updateSettingUC = new UpdateSettingHandler(settingRepo)

export async function getSettingAction<K extends SettingKey>(key: K): Promise<ActionResult<SettingsValueMap[K] | null>> {
  try {
    const data = await getSettingUC.execute({ key })
    return { success: true, data: data.value as SettingsValueMap[K], error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function updateSettingAction<K extends SettingKey>(
  key: K,
  value: SettingsValueMap[K]
): Promise<ActionResult<SettingsValueMap[K]>> {
  const session = await auth()
  
  try {
    const result = await updateSettingUC.execute({ 
      key, 
      value,
      currentUserRole: session?.user?.role 
    })
    return { success: true, data: result.value, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}
