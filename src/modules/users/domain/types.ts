export const UserRole = ["admin", "user"] as const;
export type UserRole = (typeof UserRole)[number];

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
