import { NextRequest } from "next/server"
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response"
import { auth } from "@/shared/lib/auth"
import { DrizzleUserRepository } from "../../infrastructure/database/repositories/drizzle-user.repository"
import { GetUserProfileHandler } from "../../application/use-cases/get-user-profile/get-user-profile.handler"
import { UpdateProfileHandler } from "../../application/use-cases/update-profile/update-profile.handler"
import { updateUserSchema } from "../../application/validations"

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
    return handleApiError(error, "GET_USER_PROFILE")
  }
}

export async function updateUserProfileHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiError("Unauthorized", 401)

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) {
      return apiError(parsed.error.issues.map((issue) => issue.message).join(", "), 400)
    }

    // `id` and `user` are placed after the spread so a malicious `id`/`user`
    // field in the request body can never override the authenticated caller's
    // own id/session (would otherwise let a caller edit someone else's profile).
    const updated = await updateProfileUC.execute({ ...parsed.data, id: session.user.id, user: session.user })
    return apiSuccess(updated)
  } catch (error: unknown) {
    return handleApiError(error, "UPDATE_USER_PROFILE")
  }
}
