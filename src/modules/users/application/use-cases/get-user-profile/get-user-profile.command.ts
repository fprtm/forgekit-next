import { AuthUser } from "@/modules/auth/domain/types"

export interface GetUserProfileCommand {
  id: string
  currentUser?: AuthUser
}
