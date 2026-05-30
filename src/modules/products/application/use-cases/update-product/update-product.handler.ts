import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { UpdateProductCommand } from "./update-product.command"
import { UpdateProductDTO } from "./update-product.dto"
import { updateProductSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"
import { ProductNotFoundException } from "../../../domain/exceptions/product-not-found.exception"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { ProductUpdatedEvent } from "../../../domain/events/product.events"
import { ProductEntity } from "../../../domain/entities/product.entity"

export class UpdateProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<UpdateProductDTO> {
    const { id, user, ...input } = command
    const validated = updateProductSchema.parse(input)
    const existing = await this.productRepository.findById(id)
    if (!existing) throw new ProductNotFoundException(id)

    if (user) {
      if (!can(user, "products:update", existing as unknown as Record<string, unknown>)) {
        throw new UnauthorizedException()
      }
    }

    const updatedProduct = await this.productRepository.update(id, validated)

    await eventDispatcher.dispatch(
      new ProductUpdatedEvent(
        updatedProduct as ProductEntity,
        user?.id || null
      )
    )

    return updatedProduct
  }
}
