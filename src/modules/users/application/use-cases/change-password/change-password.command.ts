import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface ChangePasswordCommand extends AuthenticatedCommand {
  userId: string
  currentPassword: string
  newPassword: string
}
