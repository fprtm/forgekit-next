import { UserEntity } from "../entities/user.entity"

export interface IUserRepository {
  findMany(): Promise<UserEntity[]>
  create(data: any): Promise<UserEntity>
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: string): Promise<UserEntity | null>
  update(id: string, data: any): Promise<UserEntity>
  delete(id: string): Promise<UserEntity>
}
