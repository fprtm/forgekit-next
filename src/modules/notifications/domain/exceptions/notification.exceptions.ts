import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class NotificationSettingNotFoundException extends DomainException {
  constructor(message = "Notification settings not found for this user") {
    super(message, "NOTIFICATION_SETTINGS_NOT_FOUND", 404);
  }
}

export class NotificationNotFoundException extends DomainException {
  constructor(message = "Notification not found") {
    super(message, "NOTIFICATION_NOT_FOUND", 404);
  }
}
