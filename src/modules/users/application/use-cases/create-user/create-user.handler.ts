import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { CreateUserCommand } from "./create-user.command"
import { CreateUserDTO } from "./create-user.dto"
import { createUserSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"

export class CreateUserHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<CreateUserDTO> {
    const { currentUser, ...input } = command
    const parsed = createUserSchema.parse(input)

    if (currentUser) {
      if (!can(currentUser, "users:create")) {
        throw new Error("Forbidden")
      }
    }

    const created = await this.userRepository.create({ ...parsed })
    return {
      ...created,
      emailVerified: null,
    }
  }
}
