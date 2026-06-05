import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS", 401);
  }
}

export class SessionExpiredException extends DomainException {
  constructor() {
    super("Your session has expired. Please log in again.", "SESSION_EXPIRED", 401);
  }
}
