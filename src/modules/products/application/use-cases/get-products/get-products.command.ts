import { AuthUser } from "@/modules/auth/domain/types"

export interface GetProductsCommand {
  search?: string
  limit?: number
  user?: AuthUser
}
