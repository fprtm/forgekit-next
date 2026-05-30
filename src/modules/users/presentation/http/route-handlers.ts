import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/shared/lib/api-response"
import { auth } from "@/shared/lib/auth"
import { DrizzleUserRepository } from "../../infrastructure/database/repositories/drizzle-user.repository"
import { GetUserProfileHandler } from "../../application/use-cases/get-user-profile/get-user-profile.handler"
import { UpdateProfileHandler } from "../../application/use-cases/update-profile/update-profile.handler"

const userRepo = new DrizzleUserRepository()
const getUserProfileUC = new GetUserProfileHandler(userRepo)
const updateProfileUC = new UpdateProfileHandler(userRepo)

export async function getUserProfileHandler() {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const user = await getUserProfileUC.execute({ id: session.user.id, currentUser: session.user })
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
    const updated = await updateProfileUC.execute({ id: session.user.id, ...body, currentUser: session.user })
    return apiSuccess(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return apiError(message, 500)
  }
}
