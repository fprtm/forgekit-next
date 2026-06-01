import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { GetProductsCommand } from "./get-products.command"
import { GetProductsDTO } from "./get-products.dto"
import { can } from "@/modules/auth/domain/policies"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"

export class GetProductsHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: GetProductsCommand): Promise<GetProductsDTO> {
    if (command.user) {
      if (!can(command.user, "products:read")) {
        throw new UnauthorizedException("You do not have permission to view products")
      }
    }
    return this.productRepository.findMany(command.search, command.limit)
  }
}
