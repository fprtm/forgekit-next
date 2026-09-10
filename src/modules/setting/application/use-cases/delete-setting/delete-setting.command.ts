import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"
import { SettingKey } from "../../../domain/entities/setting.entity"

export interface DeleteSettingCommand extends AuthenticatedCommand {
  key: SettingKey
}
