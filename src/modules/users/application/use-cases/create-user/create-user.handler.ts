import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { CreateUserCommand } from "./create-user.command"
import { CreateUserDTO } from "./create-user.dto"
import { createUserSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserCreatedEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"

export class CreateUserHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<CreateUserDTO> {
    const { currentUser, ...input } = command
    const parsed = createUserSchema.parse(input)

    if (currentUser) {
      if (!can(currentUser, "users:create")) {
        throw new UnauthorizedException()
      }
    }

    const created = await this.userRepository.create({ ...parsed })
    
    await eventDispatcher.dispatch(
      new UserCreatedEvent(created as UserEntity, currentUser?.id || null)
    )

    return {
      ...created,
      emailVerified: null,
    }
  }
}
