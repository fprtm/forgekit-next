import { ProductEntity, CreateProductInput, UpdateProductInput } from "../entities/product.entity"

export interface IProductRepository {
  findMany(search?: string, limit?: number): Promise<ProductEntity[]>
  findById(id: string): Promise<ProductEntity | null>
  create(data: CreateProductInput): Promise<ProductEntity>
  update(id: string, data: UpdateProductInput): Promise<ProductEntity>
  delete(id: string): Promise<ProductEntity>
}
