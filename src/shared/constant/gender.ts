export const Gender = ["male", "female", "other"] as const;
export type Gender = (typeof Gender)[number];