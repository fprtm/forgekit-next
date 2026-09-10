import crypto from "crypto"
import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { IPasswordResetTokenRepository } from "../../../domain/repositories/password-reset-token-repository.interface"
import { RequestPasswordResetCommand } from "./request-password-reset.command"
import { RequestPasswordResetDTO } from "./request-password-reset.dto"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { PasswordResetRequestedEvent } from "../../../domain/events/user.events"

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000 // 30 minutes

// Always the exact same response, whether or not the email is registered —
// this is what makes the flow non-enumerable.
const GENERIC_RESPONSE: RequestPasswordResetDTO = {
  message: "If an account with that email exists, a password reset link has been sent.",
}

export class RequestPasswordResetHandler {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: IPasswordResetTokenRepository,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<RequestPasswordResetDTO> {
    const user = await this.userRepository.findByEmail(command.email)

    // Do not leak whether this email is registered — return the generic
    // response either way, only doing real work when a user actually exists.
    if (!user) return GENERIC_RESPONSE

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS)

    // Invalidate any previously issued (unused) tokens for this identifier
    // before issuing a new one, so only the latest reset link ever works.
    await this.tokenRepository.deleteAllForIdentifier(user.email)
    await this.tokenRepository.create(user.email, token, expires)

    await eventDispatcher.dispatch(new PasswordResetRequestedEvent(user.email, token))

    return GENERIC_RESPONSE
  }
}
