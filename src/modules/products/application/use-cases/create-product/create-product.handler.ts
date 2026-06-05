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
    const createdProduct = await this.productRepository.create({
      name: validated.name,
      description: validated.description || null,
      price: validated.price,
    })

    await eventDispatcher.dispatch(
      new ProductCreatedEvent(
        createdProduct as ProductEntity,
        command.user?.id || null
      )
    )

    return createdProduct
  }
}
