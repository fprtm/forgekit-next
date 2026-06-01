export const UserRole = ["super_admin", "admin", "user"] as const;
export type UserRole = (typeof UserRole)[number];

export interface UserProfile {
  id: string
  userId: string
  bio: string | null
  phoneNumber: string | null
  dateOfBirth: string | null
  gender: string | null
  preferredPronouns: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserEntity {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: UserRole
  password?: string | null
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile | null
}
