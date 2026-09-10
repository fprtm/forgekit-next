import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface DeleteProductCommand extends AuthenticatedCommand {
  id: string
}
