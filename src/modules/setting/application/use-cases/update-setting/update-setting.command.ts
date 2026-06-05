import { SettingKey, SettingsValueMap } from "../../../domain/entities/setting.entity"

export interface UpdateSettingCommand<K extends SettingKey> {
  key: K
  value: SettingsValueMap[K]
  currentUserRole?: string
}
