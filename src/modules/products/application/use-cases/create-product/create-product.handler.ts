import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { CreateProductCommand } from "./create-product.command"
import { CreateProductDTO } from "./create-product.dto"
import { createProductSchema } from "../../validations"
import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service"
import { ProductCreatedEvent } from "../../../domain/events/product.events"
import { ProductEntity } from "../../../domain/entities/product.entity"

export class CreateProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: CreateProductCommand): Promise<CreateProductDTO> {
    const validated = createProductSchema.parse(command)

    // Validates invariants (e.g. price) via PriceValueObject before persisting
    const productEntity = ProductEntity.create({
      name: validated.name,
      description: validated.description || null,
      price: validated.price,
    })

    const createdProduct = await this.productRepository.create({
      name: productEntity.name,
      description: productEntity.description,
      price: productEntity.price,
    })

    await eventDispatcher.dispatch(
      new ProductCreatedEvent(
        createdProduct,
        command.user.id
      )
    )

    return createdProduct
  }
}
