export const PracticeType = ["psychologist", "psychiatrist", "counselor"] as const;
export type PracticeType = (typeof PracticeType)[number];