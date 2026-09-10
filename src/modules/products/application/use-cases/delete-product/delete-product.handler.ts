import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { DeleteProductCommand } from "./delete-product.command"
import { DeleteProductDTO } from "./delete-product.dto"
import { can } from "@/modules/auth/domain/policies"
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { ProductDeletedEvent } from "../../../domain/events/product.events"

export class DeleteProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: DeleteProductCommand): Promise<DeleteProductDTO> {
    const existing = await this.productRepository.findById(command.id)
    if (!existing) throw new ProductNotFoundException(command.id)

    if (!can(command.user, "products:delete", existing as unknown as Record<string, unknown>)) {
      throw new UnauthorizedException()
    }

    const deletedProduct = await this.productRepository.delete(command.id)

    await eventDispatcher.dispatch(
      new ProductDeletedEvent(
        deletedProduct.id,
        deletedProduct.name,
        command.user.id
      )
    )

    return deletedProduct
  }
}
