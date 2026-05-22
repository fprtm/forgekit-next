export const UserRole = ["admin", "user"] as const;
export type UserRole = (typeof UserRole)[number];
