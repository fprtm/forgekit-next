export class ProductNotFoundException extends Error {
  public readonly id: string;

  constructor(id: string) {
    super(`Product with ID "${id}" was not found.`);
    this.name = "ProductNotFoundException";
    this.id = id;
  }
}
