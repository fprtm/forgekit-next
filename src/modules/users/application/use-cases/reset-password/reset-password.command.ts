import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface ResetPasswordCommand extends AuthenticatedCommand {
  userId: string
}
