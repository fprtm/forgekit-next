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
