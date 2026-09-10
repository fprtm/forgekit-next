import crypto from "crypto"
import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { ResetPasswordCommand } from "./reset-password.command"
import { ResetPasswordDTO } from "./reset-password.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { UserNotFoundException } from "../../../domain/exceptions/user.exceptions"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserPasswordResetEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"
import { IPasswordHasher } from "@/modules/auth/domain/services/password-hasher.interface"

export class ResetPasswordHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordDTO> {
    const { userId, user: currentUser } = command

    if (!can(currentUser, "users:update", { ownerId: userId })) {
      throw new UnauthorizedException()
    }

    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundException(userId)

    const newPassword = crypto.randomBytes(18).toString("base64url")

    const hashedPassword = await this.passwordHasher.hash(newPassword)
    await this.userRepository.updatePassword(userId, hashedPassword)

    await eventDispatcher.dispatch(
      new UserPasswordResetEvent(user as UserEntity, currentUser.id)
    )

    return {
      email: user.email,
      newPassword,
    }
  }
}
