import { Setting, SettingCategory, SettingKey, SettingsValueMap } from "../entities/setting.entity"

export interface ISettingRepository {
  findByKey<K extends SettingKey>(key: K): Promise<Setting<K> | undefined>
  findMany(): Promise<Setting[]>
  findByCategory(category: SettingCategory): Promise<Setting[]>
  upsert<K extends SettingKey>(key: K, value: SettingsValueMap[K]): Promise<Setting<K>>
  delete(key: SettingKey): Promise<Setting | undefined>
}
