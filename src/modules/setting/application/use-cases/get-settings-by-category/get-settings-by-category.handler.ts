import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import { GetSettingsByCategoryCommand } from "./get-settings-by-category.command"
import { GetSettingsByCategoryDTO } from "./get-settings-by-category.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"

export class GetSettingsByCategoryHandler {
  constructor(private settingRepository: ISettingRepository) {}

  async execute(command: GetSettingsByCategoryCommand): Promise<GetSettingsByCategoryDTO> {
    if (command.user) {
      if (!can(command.user, "settings:read")) {
        throw new UnauthorizedException("You do not have permission to view settings")
      }
    }

    return this.settingRepository.findByCategory(command.category)
  }
}
