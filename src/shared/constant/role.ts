export const UserRole = [
  "super_admin",
  "admin",
  "therapist",
  "patient",
  "guest",
] as const;
export type UserRole = (typeof UserRole)[number];