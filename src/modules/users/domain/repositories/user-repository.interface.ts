import { UserEntity } from "../entities/user.entity"

export interface IUserRepository {
  findMany(): Promise<UserEntity[]>
  create(data: Partial<UserEntity>): Promise<UserEntity>
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: string): Promise<UserEntity | null>
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>
  delete(id: string): Promise<UserEntity>
  updatePassword(id: string, hashedPassword: string): Promise<UserEntity>
}
