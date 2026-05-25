import { UserRole } from "@/config/roles"


export interface UserEntity {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}
export { UserRole }

