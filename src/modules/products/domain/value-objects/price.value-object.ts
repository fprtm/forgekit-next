import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class PriceValueObject {
  private readonly amount: number;

  private constructor(amount: number) {
    this.amount = amount;
  }

  public static create(amount: number): PriceValueObject {
    if (amount < 0) {
      throw new DomainException("Price cannot be negative", "INVALID_PRICE", 400);
    }

    // Ensure only 2 decimal places max for standard currency
    const formattedAmount = Math.round(amount * 100) / 100;
    
    return new PriceValueObject(formattedAmount);
  }

  public getValue(): number {
    return this.amount;
  }

  public format(currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(this.amount);
  }

  public equals(other: PriceValueObject): boolean {
    return this.amount === other.getValue();
  }
}
