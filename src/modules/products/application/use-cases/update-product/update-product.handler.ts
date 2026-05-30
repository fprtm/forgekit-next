import { IProductRepository } from "../../../domain/repositories/product-repository.interface"
import { UpdateProductCommand } from "./update-product.command"
import { UpdateProductDTO } from "./update-product.dto"
import { updateProductSchema } from "../../validations"
import { can } from "@/modules/auth/domain/policies"

export class UpdateProductHandler {
  constructor(private productRepository: IProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<UpdateProductDTO> {
    const { id, user, ...input } = command
    const validated = updateProductSchema.parse(input)
    const existing = await this.productRepository.findById(id)
    if (!existing) throw new Error("Product not found")

    if (user) {
      if (!can(user, "products:update", existing as unknown as Record<string, unknown>)) {
        throw new Error("Forbidden")
      }
    }

    return this.productRepository.update(id, validated)
  }
}
