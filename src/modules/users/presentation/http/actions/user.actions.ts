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
import { CreateUserCommand } from "../../../application/use-cases/create-user/create-user.command"
import { UpdateProfileCommand } from "../../../application/use-cases/update-profile/update-profile.command"
import { RegisterUserCommand } from "../../../application/use-cases/register-user/register-user.command"

import { logActivityUC } from "@/modules/audit-logs/presentation/http/actions/audit-log.actions"

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

export async function getUsersAction(): Promise<ActionResult<UserEntity[]>> {
  const session = await auth()
  try {
    const users = await getUsersUC.execute({ currentUser: session?.user })
    return { success: true, data: users, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getUserAction(id: string): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  try {
    const user = await getUserProfileUC.execute({ id, currentUser: session?.user })
    return { success: true, data: user, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getCurrentUser(): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }
  try {
    const user = await getUserProfileUC.execute({ id: session.user.id, currentUser: session.user })
    return { success: true, data: user, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function updateUser(
  input: Omit<UpdateProfileCommand, "id" | "currentUser">,
  id?: string,
): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null }
  }
  const targetId = id || session.user.id
  try {
    const updated = await updateProfileUC.execute({ id: targetId, ...input, currentUser: session.user })
    // Auditing activity
    await logActivityUC.execute({
      userId: session.user.id,
      action: "user:update",
      details: `User profile updated: id=${targetId} (Name: ${updated.name}, Role: ${updated.role})`,
    })
    return { success: true, data: updated, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  try {
    const deleted = await deleteUserUC.execute({ id, currentUser: session?.user })
    // Auditing activity
    await logActivityUC.execute({
      userId: session?.user?.id || null,
      action: "user:delete",
      details: `User deleted: id=${id} (Email: ${deleted.email}, Role: ${deleted.role})`,
    })
    return { success: true, data: deleted, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function createUserAction(
  input: Omit<CreateUserCommand, "currentUser">,
): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  try {
    const user = await createUserUC.execute({ ...input, currentUser: session?.user })
    // Auditing activity
    await logActivityUC.execute({
      userId: session?.user?.id || null,
      action: "user:create",
      details: `User created: id=${user.id} (Email: ${user.email}, Role: ${user.role})`,
    })
    return { success: true, data: user, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function registerUserAction(
  input: RegisterUserCommand,
): Promise<ActionResult<Omit<UserEntity, "password" | "emailVerified">>> {
  try {
    const user = await registerUserUC.execute(input)
    // Auditing activity
    await logActivityUC.execute({
      userId: user.id,
      action: "user:register",
      details: `User registered: id=${user.id} (Email: ${user.email}, Role: ${user.role})`,
    })
    return { 
      success: true, 
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
        image: null
      }, 
      error: null 
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}
