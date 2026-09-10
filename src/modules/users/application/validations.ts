import z from "zod"
import { UserRole } from "@/shared/config/roles"

export const updateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  role: z.enum(UserRole),
  email: z.string().email("Invalid email address").optional(),
  bio: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  preferredPronouns: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmNewPassword: z.string().min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateUserDTO = z.input<typeof updateUserSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateUserDTO = z.input<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
