import { db } from "@/db";
import { eq, desc, and, count } from "drizzle-orm";
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
        type: notification.type,
        priority: notification.priority,
        read: notification.read,
        readAt: notification.readAt,
      })
      .returning();

    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      message: row.message,
      type: row.type as NotificationEntity["type"],
      priority: row.priority as NotificationEntity["priority"],
      read: row.read,
      readAt: row.readAt,
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
      type: row.type as NotificationEntity["type"],
      priority: row.priority as NotificationEntity["priority"],
      read: row.read,
      readAt: row.readAt,
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
        type: row.type as NotificationEntity["type"],
        priority: row.priority as NotificationEntity["priority"],
        read: row.read,
        readAt: row.readAt,
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
      .set({ read: true, readAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.id, id));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true, readAt: new Date(), updatedAt: new Date() })
      .where(eq(notifications.userId, userId));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );
    return row?.value ?? 0;
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
      system: row.system,
      security: row.security,
      marketing: row.marketing,
      product: row.product,
      general: row.general,
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
        system: settings.system,
        security: settings.security,
        marketing: settings.marketing,
        product: settings.product,
        general: settings.general,
      })
      .onConflictDoUpdate({
        target: userNotificationSettings.userId,
        set: {
          email: settings.email,
          push: settings.push,
          whatsapp: settings.whatsapp,
          system: settings.system,
          security: settings.security,
          marketing: settings.marketing,
          product: settings.product,
          general: settings.general,
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
      system: row.system,
      security: row.security,
      marketing: row.marketing,
      product: row.product,
      general: row.general,
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
      system: row.system,
      security: row.security,
      marketing: row.marketing,
      product: row.product,
      general: row.general,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
