import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class EmailValueObject {
  private readonly email: string;

  private constructor(email: string) {
    this.email = email;
  }

  public static create(email: string): EmailValueObject {
    if (!email || email.trim() === "") {
      throw new DomainException("Email cannot be empty", "INVALID_EMAIL", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainException(`Invalid email format: ${email}`, "INVALID_EMAIL", 400);
    }

    return new EmailValueObject(email.toLowerCase().trim());
  }

  public getValue(): string {
    return this.email;
  }

  public equals(other: EmailValueObject): boolean {
    return this.email === other.getValue();
  }
}
