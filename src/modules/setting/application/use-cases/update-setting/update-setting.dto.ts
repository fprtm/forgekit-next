import { Setting, SettingKey } from "../../../domain/entities/setting.entity"

export type UpdateSettingDTO<K extends SettingKey> = Setting<K>
