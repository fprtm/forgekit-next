import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { GetProductCommand } from "./get-product.command"
import { GetProductDTO } from "./get-product.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { ProductNotFoundException } from "../../../domain/exceptions/product-not-found.exception"

export class GetProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: GetProductCommand): Promise<GetProductDTO> {
    if (command.user) {
      if (!can(command.user, "products:read")) {
        throw new UnauthorizedException("You do not have permission to view products")
      }
    }
    const product = await this.productRepository.findById(command.id)
    if (!product) throw new ProductNotFoundException(command.id)
    return product
  }
}
