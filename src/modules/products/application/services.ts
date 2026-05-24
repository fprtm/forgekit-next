import { ProductsRepository } from "../infrastructure/repository"
import { createProductSchema, updateProductSchema, CreateProductDTO, UpdateProductDTO } from "./validations"
import { can } from "@/modules/auth/domain/policies"
import { AuthUser } from "@/modules/auth/domain/types"

export const ProductsService = {
  async getProducts(search?: string, limit?: number) {
    return ProductsRepository.findMany(search, limit)
  },

  async getProductById(id: string) {
    const product = await ProductsRepository.findById(id)
    if (!product) throw new Error("Product not found")
    return product
  },

  async createProduct(input: CreateProductDTO, user?: AuthUser) {
    const parsed = createProductSchema.parse(input)
    
    if (user) {
      if (!can(user, "products:create")) {
        throw new Error("Forbidden")
      }
    }

    return ProductsRepository.create(parsed)
  },

  async updateProduct(id: string, input: UpdateProductDTO, user?: AuthUser) {
    const parsed = updateProductSchema.parse(input)
    const existing = await ProductsRepository.findById(id)
    if (!existing) throw new Error("Product not found")
    
    if (user) {
      if (!can(user, "products:update", existing)) {
        throw new Error("Forbidden")
      }
    }
    
    return ProductsRepository.update(id, parsed)
  },

  async deleteProduct(id: string, user?: AuthUser) {
    const existing = await ProductsRepository.findById(id)
    if (!existing) throw new Error("Product not found")
      
    if (user) {
      if (!can(user, "products:delete", existing)) {
        throw new Error("Forbidden")
      }
    }

    return ProductsRepository.delete(id)
  }
}
