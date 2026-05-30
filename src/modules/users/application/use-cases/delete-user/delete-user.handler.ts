import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { DeleteUserCommand } from "./delete-user.command"
import { DeleteUserDTO } from "./delete-user.dto"
import { can } from "@/modules/auth/domain/policies"

export class DeleteUserHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: DeleteUserCommand): Promise<DeleteUserDTO> {
    const existing = await this.userRepository.findById(command.id)
    if (!existing) throw new Error("User not found")

    if (command.currentUser) {
      if (!can(command.currentUser, "users:delete", { ownerId: command.id })) {
        throw new Error("Forbidden")
      }
    }

    return this.userRepository.delete(command.id)
  }
}
