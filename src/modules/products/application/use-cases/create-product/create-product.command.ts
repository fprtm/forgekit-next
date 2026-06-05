import { AuthUser } from "@/modules/auth/domain/types";

export interface CreateProductCommand {
  name: string
  description?: string
  price: number
  user?: AuthUser
}
