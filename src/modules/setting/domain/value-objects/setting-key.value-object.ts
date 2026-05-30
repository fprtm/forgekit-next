import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class SettingKeyValueObject {
  private readonly key: string;

  private constructor(key: string) {
    this.key = key;
  }

  public static create(key: string): SettingKeyValueObject {
    if (!key || key.trim() === "") {
      throw new DomainException("Setting key cannot be empty", "INVALID_SETTING_KEY", 400);
    }

    // Enforce UPPERCASE_SNAKE_CASE format
    const snakeCaseRegex = /^[A-Z0-9_]+$/;
    if (!snakeCaseRegex.test(key)) {
      throw new DomainException(`Setting key must be UPPERCASE_SNAKE_CASE. Got: ${key}`, "INVALID_SETTING_KEY", 400);
    }

    return new SettingKeyValueObject(key);
  }

  public getValue(): string {
    return this.key;
  }
}
