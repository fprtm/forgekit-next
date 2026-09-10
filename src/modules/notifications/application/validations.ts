import { z } from "zod"

const notificationTypeSchema = z.enum(["system", "security", "marketing", "product", "general"])

export const sendNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
  type: notificationTypeSchema.optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
})

export const updateNotificationSettingsSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  whatsapp: z.boolean().optional(),
  subscriptions: z.record(notificationTypeSchema, z.boolean()).optional(),
})

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>
export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>
