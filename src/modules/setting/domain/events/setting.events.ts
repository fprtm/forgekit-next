import { DomainEvent } from "@/shared/domain/events/domain.event";
import { Setting } from "../entities/setting.entity";

export class SettingUpdatedEvent implements DomainEvent {
  public readonly eventName = "SettingUpdatedEvent";
  public readonly occurredOn: Date;
  public readonly setting: Setting;
  public readonly updatedByUserId: string;

  constructor(setting: Setting, updatedByUserId: string) {
    this.occurredOn = new Date();
    this.setting = setting;
    this.updatedByUserId = updatedByUserId;
  }
}
