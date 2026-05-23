import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(2, "String must contain at least 2 character(s)").max(100, "Name is too long"),
  description: z.string().nullable().default(null),
  price: z.number().int().min(1, "Price must be greater than 0"),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductDTO = z.input<typeof createProductSchema>
export type UpdateProductDTO = z.input<typeof updateProductSchema>
