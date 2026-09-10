import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface UpdateProductCommand extends AuthenticatedCommand {
  id: string
  name?: string
  description?: string | null
  price?: number
}
