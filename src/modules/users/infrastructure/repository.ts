import { db } from "@/db"
import { eq } from "drizzle-orm"
import { users } from "./schema"

export const UsersRepository = {
  async findMany() {
    return db.query.users.findMany()
  },

  async create(data: typeof users.$inferInsert) {
    const [created] = await db.insert(users).values(data).returning()
    return created
  },

  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    })
  },

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning()
    return updated
  },

  async delete(id: string) {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning()
    return deleted
  }
}
