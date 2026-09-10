import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import { GetAllSettingsCommand } from "./get-all-settings.command"
import { GetAllSettingsDTO } from "./get-all-settings.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"

export class GetAllSettingsHandler {
  constructor(private settingRepository: ISettingRepository) {}

  async execute(command: GetAllSettingsCommand = {}): Promise<GetAllSettingsDTO> {
    if (command.user) {
      if (!can(command.user, "settings:read")) {
        throw new UnauthorizedException("You do not have permission to view settings")
      }
    }

    return this.settingRepository.findMany()
  }
}
