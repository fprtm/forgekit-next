import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-response"
import { auth } from "@/lib/auth"
import { UsersService } from "../../application/services"

export async function getUserProfileHandler() {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const user = await UsersService.getUserProfile(session.user.id)
    return apiSuccess(user)
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "User not found") {
      return apiError(error.message, 404)
    }
    return apiError("Internal server error", 500)
  }
}

export async function updateUserProfileHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()
    const updated = await UsersService.updateProfile(session.user.id, body)
    return apiSuccess(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}
