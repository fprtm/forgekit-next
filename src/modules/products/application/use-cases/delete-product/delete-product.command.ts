import { AuthUser } from "@/modules/auth/domain/types"

export interface DeleteProductCommand {
  id: string
  user?: AuthUser
}
