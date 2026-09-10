import { AuthUser } from "@/modules/auth/domain/types"
import { UserRole } from "@/shared/config/roles"

export interface GetUsersCommand {
  currentUser?: AuthUser
  role?: UserRole | "all"
}
