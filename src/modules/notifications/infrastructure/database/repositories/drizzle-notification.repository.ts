import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { notifications, userNotificationSettings } from "@/modules/notifications/infrastructure/database/drizzle/schema";
import { NotificationRepository, PaginationOptions } from "@/modules/notifications/domain/repositories/notification.repository";
import { NotificationEntity, UserNotificationSettingsEntity } from "@/modules/notifications/domain/entities/notification.entity";

export class DrizzleNotificationRepository implements NotificationRepository {
  async save(
    notification: Omit<NotificationEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<NotificationEntity> {
    const [row] = await db
      .insert(notifications)
      .values({
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        read: notification.read,
      })
      .returning();

    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      message: row.message,
      read: row.read,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const [row] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));

    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      message: row.message,
      read: row.read,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<NotificationEntity[]> {
    try {
      const query = db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(options?.limit ?? 100)
        .offset(options?.offset ?? 0);

      const rows = await query;

      return rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        title: row.title,
        message: row.message,
        read: row.read,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error) {
      console.error("[DrizzleNotificationRepository.findByUserId] Database error:", error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(notifications.id, id));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true, updatedAt: new Date() })
      .where(eq(notifications.userId, userId));
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, userId));
  }

  async findSettingsByUserId(userId: string): Promise<UserNotificationSettingsEntity | null> {
    const [row] = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, userId));

    if (!row) return null;
    return {
      id: row.id,
      userId: row.userId,
      email: row.email,
      push: row.push,
      whatsapp: row.whatsapp,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async saveSettings(
    settings: Omit<UserNotificationSettingsEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<UserNotificationSettingsEntity> {
    const [row] = await db
      .insert(userNotificationSettings)
      .values({
        userId: settings.userId,
        email: settings.email,
        push: settings.push,
        whatsapp: settings.whatsapp,
      })
      .onConflictDoUpdate({
        target: userNotificationSettings.userId,
        set: {
          email: settings.email,
          push: settings.push,
          whatsapp: settings.whatsapp,
          updatedAt: new Date(),
        },
      })
      .returning();

    return {
      id: row.id,
      userId: row.userId,
      email: row.email,
      push: row.push,
      whatsapp: row.whatsapp,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async updateSettings(
    userId: string,
    settings: Partial<Omit<UserNotificationSettingsEntity, "id" | "userId" | "createdAt" | "updatedAt">>
  ): Promise<UserNotificationSettingsEntity> {
    const [row] = await db
      .update(userNotificationSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userNotificationSettings.userId, userId))
      .returning();

    return {
      id: row.id,
      userId: row.userId,
      email: row.email,
      push: row.push,
      whatsapp: row.whatsapp,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
