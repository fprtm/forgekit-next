import { z } from "zod";

export const logActionSchema = z.object({
  action: z.enum(["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REGISTER", "SYSTEM"]),
  entityName: z.string().min(1),
  entityId: z.string().optional().nullable(),
  actorId: z.string().min(1),
  details: z.any().optional(),
  ipAddress: z.string().optional().nullable(),
});

export type LogActionCommand = z.infer<typeof logActionSchema>;
