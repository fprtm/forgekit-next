import { auth } from "@/lib/auth"
import { UsersService } from "../../application/services"

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null }

export async function getCurrentUser(): Promise<
  ActionResult<unknown> 
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
  input: unknown,
): Promise<ActionResult<unknown>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: null }
  }

  try {
    const updated = await UsersService.updateProfile(session.user.id, input)
    return { success: true, data: updated, error: null }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error"
    return { success: false, error: message, data: null }
  }
}
