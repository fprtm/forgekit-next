import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"
import { SettingKey, SettingsValueMap } from "../../../domain/entities/setting.entity"

export interface UpdateSettingCommand<K extends SettingKey> extends AuthenticatedCommand {
  key: K
  value: SettingsValueMap[K]
}
