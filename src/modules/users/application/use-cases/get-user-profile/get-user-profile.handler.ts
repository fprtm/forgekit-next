import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { GetUserProfileCommand } from "./get-user-profile.command"
import { GetUserProfileDTO } from "./get-user-profile.dto"
import { can } from "@/modules/auth/domain/policies"

export class GetUserProfileHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: GetUserProfileCommand): Promise<GetUserProfileDTO> {
    if (command.currentUser) {
      if (!can(command.currentUser, "users:read")) {
        throw new Error("Forbidden")
      }
    }
    const user = await this.userRepository.findById(command.id)
    if (!user) throw new Error("User not found")
    return {
      ...user,
      emailVerified: null,
    }
  }
}
