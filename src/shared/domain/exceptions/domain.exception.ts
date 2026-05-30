export class DomainException extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = "DOMAIN_ERROR", statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace, but we will not leak it to the client later
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
