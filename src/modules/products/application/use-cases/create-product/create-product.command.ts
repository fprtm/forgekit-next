import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command";

export interface CreateProductCommand extends AuthenticatedCommand {
  name: string
  description?: string | null
  price: number
}
