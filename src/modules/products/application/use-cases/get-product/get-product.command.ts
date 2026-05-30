import { AuthUser } from "@/modules/auth/domain/types"

export interface GetProductCommand {
  id: string
  user?: AuthUser
}
