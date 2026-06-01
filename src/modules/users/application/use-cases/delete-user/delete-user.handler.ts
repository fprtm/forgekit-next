import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { DeleteUserCommand } from "./delete-user.command"
import { DeleteUserDTO } from "./delete-user.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { UserNotFoundException } from "../../../domain/exceptions/user.exceptions"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserDeletedEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"

export class DeleteUserHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserDTO> {
    const existing = await this.userRepository.findById(command.id)
    if (!existing) throw new UserNotFoundException(command.id)

    if (!command.currentUser) {
      throw new UnauthorizedException()
    }
    if (!can(command.currentUser, "users:delete", { ownerId: command.id })) {
      throw new UnauthorizedException()
    }

    const deleted = await this.userRepository.delete(command.id)

    await eventDispatcher.dispatch(
      new UserDeletedEvent(deleted as UserEntity, command.currentUser?.id || null)
    )

    return deleted
  }
}
