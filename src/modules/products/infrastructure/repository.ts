import { db } from "@/db"
import { desc, ilike, eq } from "drizzle-orm"
import { products } from "./schema"
import { CreateProductInput, UpdateProductInput } from "../domain/types"

export const ProductsRepository = {
  async findMany(search?: string, limit?: number) {
    return db.query.products.findMany({
      where: search ? ilike(products.name, `%${search}%`) : undefined,
      limit: limit ?? 10,
      orderBy: [desc(products.createdAt)],
    })
  },

  async findById(id: string) {
    return db.query.products.findFirst({
      where: eq(products.id, id),
    })
  },

  async create(data: CreateProductInput) {
    const [created] = await db.insert(products).values(data).returning()
    return created
  },

  async update(id: string, data: UpdateProductInput) {
    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()
    return updated
  },

  async delete(id: string) {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning()
    return deleted
  }
}
