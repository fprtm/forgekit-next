import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class UserNotFoundException extends DomainException {
  constructor(idOrEmail: string) {
    super(`User with identifier ${idOrEmail} was not found.`, "USER_NOT_FOUND", 404);
  }
}

export class InvalidRoleException extends DomainException {
  constructor(role: string) {
    super(`The role '${role}' is not valid or unauthorized.`, "INVALID_ROLE", 400);
  }
}

export class InvalidCurrentPasswordException extends DomainException {
  constructor() {
    super("The current password you entered is incorrect.", "INVALID_CURRENT_PASSWORD", 400);
  }
}

export class InvalidOrExpiredResetTokenException extends DomainException {
  constructor() {
    super("This password reset link is invalid or has expired.", "INVALID_RESET_TOKEN", 400);
  }
}

