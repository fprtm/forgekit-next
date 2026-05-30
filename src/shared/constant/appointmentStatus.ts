export const AppointmentStatus = {
  pending: "pending",
  confirmed: "confirmed",
  in_progress: "in_progress",
  completed: "completed",
  canceled: "canceled",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

