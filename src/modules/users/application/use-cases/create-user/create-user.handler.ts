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
    const { user, ...input } = command
    const parsed = createUserSchema.parse(input)

    if (!can(user, "users:create")) {
      throw new UnauthorizedException()
    }

    const newUser = UserEntity.create({
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    })

    const created = await this.userRepository.create({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      emailVerified: newUser.emailVerified,
      image: newUser.image,
      password: newUser.password,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    })

    await eventDispatcher.dispatch(new UserCreatedEvent(created, user.id))

    return {
      ...created,
      emailVerified: null,
    }
  }
}
