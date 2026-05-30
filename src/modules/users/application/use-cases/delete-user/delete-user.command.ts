import { AuthUser } from "@/modules/auth/domain/types"

export interface DeleteUserCommand {
  id: string
  currentUser?: AuthUser
}
