export const SessionType = {
  online: "online",
  offline: "offline",
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];
