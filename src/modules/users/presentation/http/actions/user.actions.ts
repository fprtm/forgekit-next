"use server"

import { auth } from "@/shared/lib/auth"
import { DrizzleUserRepository } from "../../../infrastructure/database/repositories/drizzle-user.repository"
import { GetUsersHandler } from "../../../application/use-cases/get-users/get-users.handler"
import { GetUserProfileHandler } from "../../../application/use-cases/get-user-profile/get-user-profile.handler"
import { CreateUserHandler } from "../../../application/use-cases/create-user/create-user.handler"
import { UpdateProfileHandler } from "../../../application/use-cases/update-profile/update-profile.handler"
import { DeleteUserHandler } from "../../../application/use-cases/delete-user/delete-user.handler"
import { RegisterUserHandler } from "../../../application/use-cases/register-user/register-user.handler"
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher"
import { UserEntity } from "../../../domain/entities/user.entity"
import { UserRole } from "@/shared/config/roles"
import { CreateUserCommand } from "../../../application/use-cases/create-user/create-user.command"
import { CreateUserDTO } from "../../../application/use-cases/create-user/create-user.dto"
import { UpdateProfileCommand } from "../../../application/use-cases/update-profile/update-profile.command"
import { RegisterUserCommand } from "../../../application/use-cases/register-user/register-user.command"
import { RegisterUserDTO } from "../../../application/use-cases/register-user/register-user.dto"

import { ResetPasswordHandler } from "../../../application/use-cases/reset-password/reset-password.handler"
import { ResetPasswordCommand } from "../../../application/use-cases/reset-password/reset-password.command"
import { ChangePasswordHandler } from "../../../application/use-cases/change-password/change-password.handler"
import { DomainException } from "@/shared/domain/exceptions/domain.exception"
import { logger } from "@/shared/lib/logger"
import { toPlain } from "@/shared/domain/serialize"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

const userRepo = new DrizzleUserRepository()
const passwordHasher = new BcryptPasswordHasher()
const getUsersUC = new GetUsersHandler(userRepo)
const getUserProfileUC = new GetUserProfileHandler(userRepo)
const createUserUC = new CreateUserHandler(userRepo)
const updateProfileUC = new UpdateProfileHandler(userRepo)
const deleteUserUC = new DeleteUserHandler(userRepo)
const registerUserUC = new RegisterUserHandler(userRepo, passwordHasher)
const resetPasswordUC = new ResetPasswordHandler(userRepo, passwordHasher)
const changePasswordUC = new ChangePasswordHandler(userRepo, passwordHasher)

export async function getUsersAction(
  params?: { role?: UserRole | "all" },
): Promise<ActionResult<UserEntity[]>> {
  const session = await auth()
  try {
    const users = await getUsersUC.execute({ currentUser: session?.user, role: params?.role })
    return { success: true, data: toPlain(users), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET USERS ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getUserAction(id: string): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  try {
    const user = await getUserProfileUC.execute({ id, currentUser: session?.user })
    return { success: true, data: toPlain(user), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET USER ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getUserProfileAction(): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null }
  }
  try {
    const user = await userRepo.findById(session.user.id)
    if (!user) {
      return { success: false, error: "User not found", data: null }
    }
    return { success: true, data: toPlain(user), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET USER PROFILE ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function getCurrentUser(): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }
  try {
    const user = await getUserProfileUC.execute({ id: session.user.id, currentUser: session.user })
    return { success: true, data: toPlain(user), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "GET CURRENT USER ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function updateUser(
  input: Omit<UpdateProfileCommand, "id" | "user">,
  id?: string,
): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null }
  }
  const targetId = id || session.user.id
  try {
    const updated = await updateProfileUC.execute({ ...input, id: targetId, user: session.user })
    return { success: true, data: toPlain(updated), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "UPDATE USER ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  try {
    const deleted = await deleteUserUC.execute({ id, currentUser: session?.user })
    return { success: true, data: toPlain(deleted), error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "DELETE USER ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function createUserAction(
  input: Omit<CreateUserCommand, "user">,
): Promise<ActionResult<CreateUserDTO>> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }
  try {
    const user = await createUserUC.execute({ ...input, user: session.user })
    return { success: true, data: user, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "CREATE USER ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function registerUserAction(
  input: RegisterUserCommand,
): Promise<ActionResult<RegisterUserDTO>> {
  try {
    const user = await registerUserUC.execute(input)
    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      error: null
    }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "REGISTER USER ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function resetPasswordAction(
  input: Omit<ResetPasswordCommand, "user">,
): Promise<ActionResult<{ email: string; newPassword: string }>> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }
  try {
    const result = await resetPasswordUC.execute({ ...input, user: session.user })
    return { success: true, data: result, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "RESET PASSWORD ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult<{ success: true }>> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }
  try {
    const result = await changePasswordUC.execute({
      userId: session.user.id,
      currentPassword,
      newPassword,
      user: session.user,
    })
    return { success: true, data: result, error: null }
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null }
    }
    logger.error({ err: error }, "CHANGE PASSWORD ERROR")
    return { success: false, error: "Internal Server Error", data: null }
  }
}
