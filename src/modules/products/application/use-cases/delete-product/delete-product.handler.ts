import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { DeleteProductCommand } from "./delete-product.command"
import { DeleteProductDTO } from "./delete-product.dto"
import { can } from "@/modules/auth/domain/policies"

export class DeleteProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<DeleteProductDTO> {
    const existing = await this.productRepository.findById(command.id)
    if (!existing) throw new Error("Product not found")

    if (command.user) {
      if (!can(command.user, "products:delete", existing as unknown as Record<string, unknown>)) {
        throw new Error("Forbidden")
      }
    }

    return this.productRepository.delete(command.id)
  }
}
