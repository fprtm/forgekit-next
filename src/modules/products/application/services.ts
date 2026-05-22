import { ProductsRepository } from "../infrastructure/repository"
import { createProductSchema, updateProductSchema } from "./validations"

export const ProductsService = {
  async getProducts(search: string, limit: number) {
    return ProductsRepository.findMany(search, limit)
  },

  async getProductById(id: string) {
    const product = await ProductsRepository.findById(id)
    if (!product) throw new Error("Product not found")
    return product
  },

  async createProduct(input: unknown) {
    const parsed = createProductSchema.parse(input)
    return ProductsRepository.create(parsed)
  },

  async updateProduct(id: string, input: unknown) {
    const parsed = updateProductSchema.parse(input)
    const existing = await ProductsRepository.findById(id)
    if (!existing) throw new Error("Product not found")
    
    return ProductsRepository.update(id, parsed)
  },

  async deleteProduct(id: string) {
    const existing = await ProductsRepository.findById(id)
    if (!existing) throw new Error("Product not found")
      
    return ProductsRepository.delete(id)
  }
}
