import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { GetUserProfileCommand } from "./get-user-profile.command"
import { GetUserProfileDTO } from "./get-user-profile.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { UserNotFoundException } from "../../../domain/exceptions/user.exceptions"
import { UserEntity } from "../../../domain/entities/user.entity"

export class GetUserProfileHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: GetUserProfileCommand): Promise<GetUserProfileDTO> {
    if (!command.currentUser) {
      throw new UnauthorizedException("You do not have permission to view user profiles")
    }
    if (!can(command.currentUser, "users:read")) {
      throw new UnauthorizedException("You do not have permission to view user profiles")
    }
    const user = await this.userRepository.findById(command.id)
    if (!user) throw new UserNotFoundException(command.id)

    const profile = await this.userRepository.findProfileByUserId(user.id)

    return UserEntity.reconstruct({
      ...user,
      emailVerified: null,
      profile: profile || null,
    })
  }
}
