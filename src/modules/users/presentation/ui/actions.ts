"use server"

import { auth } from "@/lib/auth"
import { UsersService } from "../../application/services"
import { UserEntity } from "../../domain/types"
import { UpdateUserDTO } from "../../application/validations"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

export async function getUsersAction(): Promise<ActionResult<UserEntity[]>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized", data: null }
  
  try {
    const users = await UsersService.getUsers()
    return { success: true, data: users, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getUserAction(id: string): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized", data: null }
  
  try {
    const user = await UsersService.getUserProfile(id)
    return { success: true, data: user, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function getCurrentUser(): Promise<
  ActionResult<UserEntity> 
> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const user = await UsersService.getUserProfile(session.user.id)
    return { success: true, data: user, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function updateUser(
  input: UpdateUserDTO,
  id?: string,
): Promise<ActionResult<UserEntity>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null }
  }

  // Jika admin, izinkan mengedit user lain lewat parameter id
  const targetId = id && session.user.role === "admin" ? id : session.user.id

  try {
    const updated = await UsersService.updateProfile(targetId, input)
    return { success: true, data: updated, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult<UserEntity>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Unauthorized", data: null }
  
  try {
    const deleted = await UsersService.deleteUser(id)
    return { success: true, data: deleted, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}
