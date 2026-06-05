import { DomainException } from "./domain.exception";

export class InvalidInputException extends DomainException {
  constructor(message = "Invalid input") {
    super(message, "INVALID_INPUT", 400);
  }
}
