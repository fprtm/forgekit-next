import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { GetProductCommand } from "./get-product.command"
import { GetProductDTO } from "./get-product.dto"
import { can } from "@/modules/auth/domain/policies"

export class GetProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: GetProductCommand): Promise<GetProductDTO> {
    if (command.user) {
      if (!can(command.user, "products:read")) {
        throw new Error("Forbidden")
      }
    }
    const product = await this.productRepository.findById(command.id)
    if (!product) throw new Error("Product not found")
    return product
  }
}
