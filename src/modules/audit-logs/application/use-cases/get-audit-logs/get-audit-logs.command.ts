import { z } from "zod";

export const getAuditLogsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  actorId: z.string().optional(),
  action: z.string().optional(),
  entityName: z.string().optional(),
});

export type GetAuditLogsCommand = z.infer<typeof getAuditLogsSchema>;
