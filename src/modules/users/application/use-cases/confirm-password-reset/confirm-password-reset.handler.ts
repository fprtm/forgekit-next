import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { IPasswordResetTokenRepository } from "../../../domain/repositories/password-reset-token-repository.interface"
import { IPasswordHasher } from "@/modules/auth/domain/services/password-hasher.interface"
import { ConfirmPasswordResetCommand } from "./confirm-password-reset.command"
import { ConfirmPasswordResetDTO } from "./confirm-password-reset.dto"
import {
  InvalidOrExpiredResetTokenException,
  UserNotFoundException,
} from "../../../domain/exceptions/user.exceptions"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { UserPasswordResetEvent } from "../../../domain/events/user.events"
import { UserEntity } from "../../../domain/entities/user.entity"

export class ConfirmPasswordResetHandler {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IPasswordResetTokenRepository,
    private passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: ConfirmPasswordResetCommand): Promise<ConfirmPasswordResetDTO> {
    const record = await this.tokenRepository.findByToken(command.token)
    if (!record || record.expires.getTime() < Date.now()) {
      throw new InvalidOrExpiredResetTokenException()
    }

    const user = await this.userRepository.findByEmail(record.identifier)
    if (!user) throw new UserNotFoundException(record.identifier)

    const hashedPassword = await this.passwordHasher.hash(command.newPassword)
    await this.userRepository.updatePassword(user.id, hashedPassword)

    // Single-use: the token is consumed regardless of what happens next.
    await this.tokenRepository.deleteByToken(command.token)

    // adminId === user.id signals "self-initiated" to the notification listener.
    await eventDispatcher.dispatch(
      new UserPasswordResetEvent(user as UserEntity, user.id)
    )

    return { email: user.email }
  }
}
