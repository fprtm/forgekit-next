import { UsersRepository } from "../infrastructure/repository"
import { updateUserSchema, UpdateUserDTO, createUserSchema, CreateUserDTO } from "./validations"
import { UserEntity } from "../domain/types"

export const UsersService = {
  async getUsers(): Promise<UserEntity[]> {
    const users = await UsersRepository.findMany()
    // Remove sensitive data before sending but keep the shape for TS
    return users.map((user) => ({
      ...user,
      emailVerified: null
    })) as UserEntity[]
  },

  async createUser(input: CreateUserDTO): Promise<UserEntity> {
    const parsed = createUserSchema.parse(input)
    const created = await UsersRepository.create({ ...parsed })
    return {
      ...created,
      emailVerified: null
    } as UserEntity
  },

  async getUserProfile(id: string): Promise<UserEntity> {
    const user = await UsersRepository.findById(id)
    if (!user) throw new Error("User not found")
    // Remove sensitive data before sending but keep the shape for TS
    return {
      ...user,
      emailVerified: null
    } as UserEntity
  },

  async updateProfile(id: string, input: UpdateUserDTO): Promise<UserEntity> {
    const parsed = updateUserSchema.parse(input)
    const updated = await UsersRepository.update(id, { ...parsed, updatedAt: new Date() })
    if (!updated) throw new Error("User not found")
    return {
      ...updated,
      emailVerified: null
    } as UserEntity
  },

  async deleteUser(id: string) {
    const existing = await UsersRepository.findById(id)
    if (!existing) throw new Error("User not found")
      
    return UsersRepository.delete(id)
  }
}
