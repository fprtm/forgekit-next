import { db } from "@/db"
import { eq } from "drizzle-orm"
import { users } from "../drizzle/schema"
import { IUserRepository } from "../../../domain/repositories/user-repository.interface"
import { UserEntity } from "../../../domain/entities/user.entity"

export class DrizzleUserRepository implements IUserRepository {
  async findMany(): Promise<UserEntity[]> {
    const results = await db.query.users.findMany()
    return results as unknown as UserEntity[]
  }

  async create(data: any): Promise<UserEntity> {
    const [created] = await db.insert(users).values(data).returning()
    return created as unknown as UserEntity
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    return (result as unknown as UserEntity) ?? null
  }

  async findById(id: string): Promise<UserEntity | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    })
    return (result as unknown as UserEntity) ?? null
  }

  async update(id: string, data: any): Promise<UserEntity> {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
    return updated as unknown as UserEntity
  }

  async delete(id: string): Promise<UserEntity> {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
    return deleted as unknown as UserEntity
  }
}
