import { AuthUser } from "@/modules/auth/domain/types"

export interface ResetPasswordCommand {
  userId: string
  currentUser?: AuthUser
}
