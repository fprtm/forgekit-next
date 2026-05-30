import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { settings } from "../drizzle/schema";
import { ISettingRepository } from "../../../domain/repositories/setting-repository.interface"
import {
  Setting,
  SettingCategory,
  SettingKey,
  SettingsValueMap,
} from "../../../domain/entities/setting.entity";

const KEY_TO_CATEGORY: Record<SettingKey, SettingCategory> = {
  deposit: "payment",
  payment_method: "payment",
  midtrans_credentials: "payment",
  cancellation: "policy",
  business_name: "business",
  timezone: "general",
  therapist_assignment: "general",
  fonnte_credentials: "general",
  notification_channels: "notification",
  email_gateway: "notification",
};

const CATEGORY_TO_KEYS: Record<SettingCategory, SettingKey[]> = {
  payment: ["deposit", "payment_method", "midtrans_credentials"],
  policy: ["cancellation"],
  business: ["business_name"],
  general: ["timezone", "therapist_assignment", "fonnte_credentials"],
  notification: ["notification_channels", "email_gateway"],
};

function mapToDomain<K extends SettingKey>(
  row: typeof settings.$inferSelect
): Setting<K> {
  const key = row.key as K;
  const category = KEY_TO_CATEGORY[key] || "general";
  return {
    id: row.id,
    key,
    category,
    value: row.value as SettingsValueMap[K],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleSettingRepository implements ISettingRepository {
  async findByKey<K extends SettingKey>(key: K): Promise<Setting<K> | undefined> {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    
    if (!row) return undefined;
    return mapToDomain<K>(row);
  }

  async findAll(): Promise<Setting[]> {
    const rows = await db.select().from(settings);
    return rows.map((row) => mapToDomain<SettingKey>(row));
  }

  async findByCategory(category: SettingCategory): Promise<Setting[]> {
    const keys = CATEGORY_TO_KEYS[category];
    if (!keys || keys.length === 0) return [];
    
    const rows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, keys));
    
    return rows.map((row) => mapToDomain<SettingKey>(row));
  }

  async upsert<K extends SettingKey>(
    key: K,
    value: SettingsValueMap[K]
  ): Promise<Setting<K>> {
    const [inserted] = await db
      .insert(settings)
      .values({
        key,
        value,
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapToDomain<K>(inserted);
  }

  async delete(key: SettingKey): Promise<Setting | undefined> {
    const [deleted] = await db
      .delete(settings)
      .where(eq(settings.key, key))
      .returning();
    
    if (!deleted) return undefined;
    return mapToDomain(deleted);
  }
}
