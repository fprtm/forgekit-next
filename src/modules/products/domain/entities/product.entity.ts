// Pure domain entity, independent of any framework or database ORM
import { PriceValueObject } from "../value-objects/price.value-object"

export interface ProductProps {
  id: string
  name: string
  description: string | null
  price: number
  createdAt: Date
  updatedAt: Date
}

export type CreateProductInput = Omit<ProductProps, "id" | "createdAt" | "updatedAt">
export type UpdateProductInput = Partial<CreateProductInput>

export class ProductEntity {
  public readonly id: string
  public readonly name: string
  public readonly description: string | null
  public readonly price: number
  public readonly createdAt: Date
  public readonly updatedAt: Date

  private constructor(props: ProductProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.price = props.price
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  /**
   * Creates a brand new product, validating invariants (e.g. price) via
   * PriceValueObject. Use this for anything originating from user input.
   */
  public static create(input: CreateProductInput): ProductEntity {
    const price = PriceValueObject.create(input.price)
    const now = new Date()

    return new ProductEntity({
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description ?? null,
      price: price.getValue(),
      createdAt: now,
      updatedAt: now,
    })
  }

  /**
   * Rehydrates a product from persistence. No validation is performed since
   * the data is assumed to already be valid (it came from the database).
   */
  public static reconstruct(raw: ProductProps): ProductEntity {
    return new ProductEntity(raw)
  }

  public updateName(newName: string): ProductEntity {
    return new ProductEntity({
      id: this.id,
      name: newName,
      description: this.description,
      price: this.price,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public updatePrice(newPrice: number): ProductEntity {
    const price = PriceValueObject.create(newPrice)

    return new ProductEntity({
      id: this.id,
      name: this.name,
      description: this.description,
      price: price.getValue(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  /**
   * Plain-object projection so this entity can cross the Server->Client
   * Component boundary (React's RSC serializer rejects class instances but
   * respects toJSON()) and so it survives JSON.stringify anywhere else.
   */
  public toJSON(): ProductProps {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
