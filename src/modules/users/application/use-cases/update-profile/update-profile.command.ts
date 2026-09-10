import { UserRole } from "@/shared/config/roles"
import { AuthenticatedCommand } from "@/shared/domain/types/authenticated-command"

export interface UpdateProfileCommand extends AuthenticatedCommand {
  id: string
  name?: string
  email?: string
  password?: string
  role?: UserRole
  bio?: string | null
  phoneNumber?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  preferredPronouns?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
}
