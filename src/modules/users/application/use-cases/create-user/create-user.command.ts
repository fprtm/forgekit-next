import { UserRole } from "@/shared/config/roles"
import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface CreateUserCommand extends AuthenticatedCommand {
  name: string
  email: string
  password?: string
  role?: UserRole
}
