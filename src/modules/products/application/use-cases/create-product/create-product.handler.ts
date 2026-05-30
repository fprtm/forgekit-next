import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { CreateProductCommand } from "./create-product.command"
import { CreateProductDTO } from "./create-product.dto"
import { createProductSchema } from "../../validations"

export class CreateProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: CreateProductCommand): Promise<CreateProductDTO> {
    const validated = createProductSchema.parse(command)
    return this.productRepository.create({
      name: validated.name,
      description: validated.description || null,
      price: validated.price,
    })
  }
}
