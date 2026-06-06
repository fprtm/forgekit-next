export const UserRole = [
  "super_admin",
  "admin",
  "user",
] as const;
export type UserRole = (typeof UserRole)[number];