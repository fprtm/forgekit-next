import { AuthUser } from "@/modules/auth/domain/types"

export interface GetAllSettingsCommand {
  user?: AuthUser
}
