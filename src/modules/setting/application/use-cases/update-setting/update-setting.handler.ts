import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import { UpdateSettingCommand } from "./update-setting.command"
import { UpdateSettingDTO } from "./update-setting.dto"
import { SettingKey } from "../../../domain/entities/setting.entity"
import { can } from "@/modules/auth/domain/policies"
import { SettingUpdateForbiddenException } from "../../../domain/exceptions/setting.exceptions"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { SettingUpdatedEvent } from "../../../domain/events/setting.events"

export class UpdateSettingHandler {
  constructor(private settingRepository: ISettingRepository) {}

  async execute<K extends SettingKey>(command: UpdateSettingCommand<K>): Promise<UpdateSettingDTO<K>> {
    if (!can(command.user, "settings:write")) {
      throw new SettingUpdateForbiddenException()
    }

    const updated = await this.settingRepository.upsert(command.key, command.value)

    await eventDispatcher.dispatch(
      new SettingUpdatedEvent(updated, command.user.id)
    )

    return updated
  }
}
