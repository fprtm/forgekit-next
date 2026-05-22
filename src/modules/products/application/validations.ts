import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().nullable().default(null),
  price: z.number().int().min(0, "Price must be a positive number"),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductDTO = z.infer<typeof createProductSchema>
export type UpdateProductDTO = z.infer<typeof updateProductSchema>
