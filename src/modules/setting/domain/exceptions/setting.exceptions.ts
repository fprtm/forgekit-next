import { DomainException } from "@/shared/domain/exceptions/domain.exception";

export class SettingUpdateForbiddenException extends DomainException {
  constructor() {
    super("You do not have permission to update system settings", "SETTING_UPDATE_FORBIDDEN", 403);
  }
}
