import { AuthUser } from "@/modules/auth/domain/types"

export interface UpdateProductCommand {
  id: string
  name?: string
  description?: string
  price?: number
  user?: AuthUser
}
