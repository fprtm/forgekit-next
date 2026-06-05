import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import { GetSettingCommand } from "./get-setting.command"
import { GetSettingDTO } from "./get-setting.dto"

export class GetSettingHandler {
  constructor(private settingRepository: ISettingRepository) {}

  async execute(command: GetSettingCommand): Promise<GetSettingDTO> {
    return this.settingRepository.findByKey(command.key)
  }
}
