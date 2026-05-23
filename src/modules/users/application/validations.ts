import z from "zod"
import { UserRole } from "../domain/types"

export const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  role: z.enum(UserRole),
})

export const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(UserRole),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password minimal 8 characters"),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateUserDTO = z.input<typeof updateUserSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateUserDTO = z.input<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
