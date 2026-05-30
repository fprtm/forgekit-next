import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { GetProductsCommand } from "./get-products.command"
import { GetProductsDTO } from "./get-products.dto"
import { can } from "@/modules/auth/domain/policies"

export class GetProductsHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: GetProductsCommand): Promise<GetProductsDTO> {
    if (command.user) {
      if (!can(command.user, "products:read")) {
        throw new Error("Forbidden")
      }
    }
    return this.productRepository.findMany(command.search, command.limit)
  }
}
