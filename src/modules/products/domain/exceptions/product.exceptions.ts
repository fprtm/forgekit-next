import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class ProductNotFoundException extends DomainException {
  public readonly id: string;

  constructor(id: string) {
    super(`Product with ID "${id}" was not found.`, "PRODUCT_NOT_FOUND", 404);
    this.id = id;
  }
}
