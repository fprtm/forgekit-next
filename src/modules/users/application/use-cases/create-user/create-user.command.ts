import { AuthUser } from "@/modules/auth/domain/types"
import { UserRole } from "@/shared/config/roles"

export interface CreateUserCommand {
  name: string
  email: string
  password?: string
  role?: UserRole
  currentUser?: AuthUser
}
