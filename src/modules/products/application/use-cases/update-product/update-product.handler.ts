import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { UpdateProductCommand } from "./update-product.command"
import { UpdateProductDTO } from "./update-product.dto"
import { updateProductSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"
import { ProductNotFoundException } from "../../../domain/exceptions/product.exceptions"
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { ProductUpdatedEvent } from "../../../domain/events/product.events"

export class UpdateProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<UpdateProductDTO> {
    const { id, user, ...input } = command
    const validated = updateProductSchema.parse(input)
    const existing = await this.productRepository.findById(id)
    if (!existing) throw new ProductNotFoundException(id)

    if (!can(user, "products:update", existing as unknown as Record<string, unknown>)) {
      throw new UnauthorizedException()
    }

    // Apply changes through entity methods rather than spreading raw fields
    let nextEntity = existing
    if (validated.name !== undefined) {
      nextEntity = nextEntity.updateName(validated.name)
    }
    if (validated.price !== undefined) {
      nextEntity = nextEntity.updatePrice(validated.price)
    }

    const updatedProduct = await this.productRepository.update(id, {
      name: nextEntity.name,
      description: validated.description !== undefined ? validated.description : nextEntity.description,
      price: nextEntity.price,
    })

    await eventDispatcher.dispatch(
      new ProductUpdatedEvent(
        updatedProduct,
        user.id
      )
    )

    return updatedProduct
  }
}
