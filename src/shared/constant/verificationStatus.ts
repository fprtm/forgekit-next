export const VerificationStatus = ["pending", "under_review", "verified", "rejected"] as const;
export type VerificationStatus = (typeof VerificationStatus)[number];