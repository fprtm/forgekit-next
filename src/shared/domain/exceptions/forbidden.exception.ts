import { DomainException } from "./domain.exception";

export class ForbiddenException extends DomainException {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}
