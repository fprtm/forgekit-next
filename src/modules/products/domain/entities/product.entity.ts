// Pure domain entity, independent of any framework or database ORM
export interface ProductEntity {
  id: string
  name: string
  description: string | null
  price: number
  createdAt: Date
  updatedAt: Date
}

export type CreateProductInput = Omit<ProductEntity, "id" | "createdAt" | "updatedAt">
export type UpdateProductInput = Partial<CreateProductInput>
