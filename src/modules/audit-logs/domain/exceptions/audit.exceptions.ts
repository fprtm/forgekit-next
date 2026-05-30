import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class AuditLogNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Audit Log with id '${id}' was not found`, "AUDIT_LOG_NOT_FOUND", 404);
  }
}

export class AuditLogTamperedException extends DomainException {
  constructor() {
    super("Audit log integrity validation failed. Tampering detected.", "AUDIT_LOG_TAMPERED", 500);
  }
}
