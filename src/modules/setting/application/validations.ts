import { z } from "zod"

export const businessSchema = z.object({
  businessName: z.string().trim().min(1, "Business name cannot be empty"),
  shortName: z.string().optional().default(""),
  description: z.string().optional().default(""),
  timezone: z.string().min(1, "Please select a timezone"),
})

export const paymentSchema = z
  .object({
    depositType: z.enum(["flat", "percentage"]),
    depositAmount: z.number().min(0, "Deposit value cannot be negative"),
    paymentMode: z.enum(["midtrans", "manual", "both"]),
    manualInstructions: z.string().optional().default(""),
    bankName: z.string().optional().default(""),
    accountNumber: z.string().optional().default(""),
    accountHolder: z.string().optional().default(""),
    confirmationPhone: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.depositType === "percentage" && data.depositAmount > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Percentage deposit cannot exceed 100%",
        path: ["depositAmount"],
      })
    }

    if (data.paymentMode !== "midtrans") {
      if (!data.bankName?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Please provide the Bank Name",
          path: ["bankName"],
        })
      }
      if (!data.accountNumber?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Please provide the Bank Account Number",
          path: ["accountNumber"],
        })
      }
      if (!data.accountHolder?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Please provide the Account Holder Name",
          path: ["accountHolder"],
        })
      }
      if (!data.confirmationPhone?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Please provide the WhatsApp Admin number",
          path: ["confirmationPhone"],
        })
      }
    }
  })

export const policySchema = z.object({
  cancellationMode: z.enum(["strict", "flexible"]),
  refundPercent: z
    .number()
    .min(0, "Refund percentage must be between 0 and 100")
    .max(100, "Refund percentage must be between 0 and 100"),
})

export const integrationSchema = z.object({
  midtransClientKey: z.string().optional().default(""),
  midtransServerKey: z.string().optional().default(""),
  midtransIsProduction: z.boolean().default(false),
  fonnteApiToken: z.string().optional().default(""),
  fonnteDeviceId: z.string().optional().default(""),
})

// Each schema below applies `.optional().default(...)` transforms on some
// fields, so the raw form input type (pre-transform) and the resolved output
// type differ: the input allows those fields to be omitted/undefined, the
// output always has them present.
export type BusinessFormValues = z.input<typeof businessSchema>
export type BusinessFormOutput = z.output<typeof businessSchema>
export type PaymentFormValues = z.input<typeof paymentSchema>
export type PaymentFormOutput = z.output<typeof paymentSchema>
export type PolicyFormValues = z.input<typeof policySchema>
export type PolicyFormOutput = z.output<typeof policySchema>
export type IntegrationFormValues = z.input<typeof integrationSchema>
export type IntegrationFormOutput = z.output<typeof integrationSchema>
