export const RiskLevel = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RiskLevel)[number];