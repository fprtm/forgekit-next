import { UsersRepository } from "../infrastructure/repository"
import { updateUserSchema } from "./validations"

export const UsersService = {
  async getUserProfile(id: string) {
    const user = await UsersRepository.findById(id)
    if (!user) throw new Error("User not found")
    // Remove sensitive data before sending
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { emailVerified, ...safeUser } = user
    return safeUser
  },

  async updateProfile(id: string, input: unknown) {
    const parsed = updateUserSchema.parse(input)
    return UsersRepository.update(id, { ...parsed, updatedAt: new Date() })
  }
}
