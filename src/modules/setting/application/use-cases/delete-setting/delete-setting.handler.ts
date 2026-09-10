import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import { DeleteSettingCommand } from "./delete-setting.command"
import { DeleteSettingDTO } from "./delete-setting.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { SettingDeletedEvent } from "../../../domain/events/setting.events"

export class DeleteSettingHandler {
  constructor(private settingRepository: ISettingRepository) {}

  async execute(command: DeleteSettingCommand): Promise<DeleteSettingDTO> {
    if (!can(command.user, "settings:write")) {
      throw new UnauthorizedException("You do not have permission to delete settings")
    }

    const deleted = await this.settingRepository.delete(command.key)

    await eventDispatcher.dispatch(
      new SettingDeletedEvent(command.key, command.user.id)
    )

    return deleted
  }
}
