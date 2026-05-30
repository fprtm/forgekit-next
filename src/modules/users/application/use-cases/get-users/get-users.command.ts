import { AuthUser } from "@/modules/auth/domain/types"

export interface GetUsersCommand {
  currentUser?: AuthUser
}
