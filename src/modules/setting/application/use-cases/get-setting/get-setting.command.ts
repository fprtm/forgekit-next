import { SettingKey } from "../../../domain/entities/setting.entity"

export interface GetSettingCommand {
  key: SettingKey
}
