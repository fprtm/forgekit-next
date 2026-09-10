import { DomainEvent } from "@/shared/domain/events/domain.event";
import { Setting, SettingKey } from "../entities/setting.entity";

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

export class SettingDeletedEvent implements DomainEvent {
  public readonly eventName = "SettingDeletedEvent";
  public readonly occurredOn: Date;
  public readonly settingKey: SettingKey;
  public readonly deletedByUserId: string;

  constructor(settingKey: SettingKey, deletedByUserId: string) {
    this.occurredOn = new Date();
    this.settingKey = settingKey;
    this.deletedByUserId = deletedByUserId;
  }
}
