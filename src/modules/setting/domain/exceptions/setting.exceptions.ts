import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class SettingNotFoundException extends DomainException {
  constructor(key: string) {
    super(`Setting with key '${key}' was not found`, "SETTING_NOT_FOUND", 404);
  }
}

export class SettingUpdateForbiddenException extends DomainException {
  constructor() {
    super("You do not have permission to update system settings", "SETTING_UPDATE_FORBIDDEN", 403);
  }
}
