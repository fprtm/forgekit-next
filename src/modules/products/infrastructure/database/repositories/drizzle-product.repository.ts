import { db } from "@/db"
import { desc, ilike, eq } from "drizzle-orm"
import { products } from "../drizzle/schema"
import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { ProductEntity, CreateProductInput, UpdateProductInput } from "../../../domain/entities/product.entity"

export class DrizzleProductRepository implements IProductRepository {
  async findMany(search?: string, limit?: number): Promise<ProductEntity[]> {
    const results = await db.query.products.findMany({
      where: search ? ilike(products.name, `%${search}%`) : undefined,
      limit: limit ?? 10,
      orderBy: [desc(products.createdAt)],
    })
    return results.map((result) => ProductEntity.reconstruct(result))
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const result = await db.query.products.findFirst({
      where: eq(products.id, id),
    })
    return result ? ProductEntity.reconstruct(result) : null
  }

  async create(data: CreateProductInput): Promise<ProductEntity> {
    const [created] = await db.insert(products).values(data).returning()
    return ProductEntity.reconstruct(created)
  }

  async update(id: string, data: UpdateProductInput): Promise<ProductEntity> {
    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()
    return ProductEntity.reconstruct(updated)
  }

  async delete(id: string): Promise<ProductEntity> {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning()
    return ProductEntity.reconstruct(deleted)
  }
}
