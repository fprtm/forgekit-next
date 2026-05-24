"use server";

import { auth } from "@/lib/auth";
import { can } from "@/modules/auth/domain/policies";
import { UsersService } from "../../application/services";
import { UserEntity } from "../../domain/types";
import { UpdateUserDTO, CreateUserDTO } from "../../application/validations";

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null };

export async function getUsersAction(): Promise<ActionResult<UserEntity[]>> {
  const session = await auth();
  if (!session?.user || !can(session.user, "users:read")) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const users = await UsersService.getUsers(session.user);
    return { success: true, data: users, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return { success: false, error: message, data: null };
  }
}

export async function getUserAction(
  id: string,
): Promise<ActionResult<UserEntity>> {
  const session = await auth();
  if (!session?.user || !can(session.user, "users:read")) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const user = await UsersService.getUserProfile(id, session.user);
    return { success: true, data: user, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return { success: false, error: message, data: null };
  }
}

export async function getCurrentUser(): Promise<ActionResult<UserEntity>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const user = await UsersService.getUserProfile(session.user.id, session.user);
    return { success: true, data: user, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return { success: false, error: message, data: null };
  }
}

export async function updateUser(
  input: UpdateUserDTO,
  id?: string,
): Promise<ActionResult<UserEntity>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null };
  }

  // The targeted user to update is either the provided id or the self session id
  const targetId = id || session.user.id;

  // Evaluate can() dynamically using targetId as the ownership context!
  // If editing self, default ownership check succeeds. If editing another user, 
  // only roles with users:update permission and super-admin bypass will succeed.
  if (!can(session.user, "users:update", { ownerId: targetId })) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const updated = await UsersService.updateProfile(targetId, input, session.user);
    return { success: true, data: updated, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return { success: false, error: message, data: null };
  }
}

export async function deleteUserAction(
  id: string,
): Promise<ActionResult<UserEntity>> {
  const session = await auth();
  
  if (!session?.user || !can(session.user, "users:delete", { ownerId: id })) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const deleted = await UsersService.deleteUser(id, session.user);
    return { success: true, data: deleted, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return { success: false, error: message, data: null };
  }
}

export async function createUserAction(
  input: CreateUserDTO,
): Promise<ActionResult<UserEntity>> {
  const session = await auth();
  
  if (!session?.user || !can(session.user, "users:create")) {
    return { success: false, error: "Unauthorized", data: null };
  }

  try {
    const user = await UsersService.createUser(input, session.user);
    return { success: true, data: user, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return { success: false, error: message, data: null };
  }
}
