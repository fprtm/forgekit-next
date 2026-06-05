import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { GetUsersCommand } from "./get-users.command"
import { GetUsersDTO } from "./get-users.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"

export class GetUsersHandler {
  constructor(private userRepository: IUserRepository) {}

  async execute(command: GetUsersCommand): Promise<GetUsersDTO> {
    if (!command.currentUser) {
      throw new UnauthorizedException("users:read")
    }
    if (!can(command.currentUser, "users:read")) {
      throw new UnauthorizedException("users:read")
    }
    const users = await this.userRepository.findMany()
    return users.map((user) => ({
      ...user,
      emailVerified: null
    }))
  }
}
