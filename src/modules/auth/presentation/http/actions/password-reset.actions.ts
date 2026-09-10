"use server"

import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository"
import { DrizzlePasswordResetTokenRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-password-reset-token.repository"
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher"
import { RequestPasswordResetHandler } from "@/modules/users/application/use-cases/request-password-reset/request-password-reset.handler"
import { ConfirmPasswordResetHandler } from "@/modules/users/application/use-cases/confirm-password-reset/confirm-password-reset.handler"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"
import { logger } from "@/shared/lib/logger"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const userRepo = new DrizzleUserRepository()
const tokenRepo = new DrizzlePasswordResetTokenRepository()
const passwordHasher = new BcryptPasswordHasher()
const requestPasswordResetUC = new RequestPasswordResetHandler(userRepo, tokenRepo)
const confirmPasswordResetUC = new ConfirmPasswordResetHandler(userRepo, tokenRepo, passwordHasher)

export async function requestPasswordResetAction(
  email: string,
): Promise<ActionResult<{ message: string }>> {
  try {
    const result = await requestPasswordResetUC.execute({ email })
    return { success: true, data: result, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "REQUEST PASSWORD RESET ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function confirmPasswordResetAction(
  token: string,
  newPassword: string,
): Promise<ActionResult<{ email: string }>> {
  try {
    const result = await confirmPasswordResetUC.execute({ token, newPassword })
    return { success: true, data: result, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "CONFIRM PASSWORD RESET ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}
