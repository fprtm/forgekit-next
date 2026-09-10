import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { IPasswordHasher } from "@/modules/auth/domain/services/password-hasher.interface"
import { ChangePasswordCommand } from "./change-password.command"
import { ChangePasswordDTO } from "./change-password.dto"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import {
  InvalidCurrentPasswordException,
  UserNotFoundException,
} from "../../../domain/exceptions/user.exceptions"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserPasswordResetEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"

/**
 * Self-service password change — distinct from ResetPasswordHandler, which is
 * an admin-only action that generates a random password for ANY user with no
 * old-password check. This handler always requires the caller's own current
 * password and only ever operates on the caller's own account.
 */
export class ChangePasswordHandler {
  constructor(
    private userRepository: IUserRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<ChangePasswordDTO> {
    const { userId, currentPassword, newPassword, user: currentUser } = command

    // Not an admin action: a caller may only ever change their own password.
    if (userId !== currentUser.id) {
      throw new UnauthorizedException("You can only change your own password.")
    }

    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundException(userId)

    if (!user.password) {
      throw new InvalidCurrentPasswordException()
    }

    const isCurrentPasswordValid = await this.passwordHasher.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new InvalidCurrentPasswordException()
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword)
    await this.userRepository.updatePassword(userId, hashedPassword)

    // adminId === user.id signals "self-initiated" to the notification listener.
    await eventDispatcher.dispatch(
      new UserPasswordResetEvent(user as UserEntity, currentUser.id)
    )

    return { success: true }
  }
}
