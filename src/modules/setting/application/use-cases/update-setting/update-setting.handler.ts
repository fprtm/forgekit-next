import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import { UpdateSettingCommand } from "./update-setting.command"
import { UpdateSettingDTO } from "./update-setting.dto"
import { SettingKey } from "../../../domain/entities/setting.entity"

export class UpdateSettingHandler {
  constructor(private settingRepository: ISettingRepository) {}

  async execute<K extends SettingKey>(command: UpdateSettingCommand<K>): Promise<UpdateSettingDTO<K>> {
    // DevSecOps Guard
    if (command.currentUserRole !== "super_admin") {
      throw new Error("Unauthorized: Only super_admin can update application settings.");
    }

    return this.settingRepository.upsert(command.key, command.value)
  }
}
