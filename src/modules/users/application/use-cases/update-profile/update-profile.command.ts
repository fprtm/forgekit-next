import { AuthUser } from "@/modules/auth/domain/types"
import { UserRole } from "../../../domain/entities/user.entity"

export interface UpdateProfileCommand {
  id: string
  name?: string
  email?: string
  password?: string
  role?: UserRole
  currentUser?: AuthUser
}
