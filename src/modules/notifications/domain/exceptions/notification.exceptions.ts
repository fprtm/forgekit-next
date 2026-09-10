import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class NotificationNotFoundException extends DomainException {
  constructor(message = "Notification not found") {
    super(message, "NOTIFICATION_NOT_FOUND", 404);
  }
}
