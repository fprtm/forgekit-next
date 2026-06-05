import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).default("general").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  read: boolean("read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userNotificationSettings = pgTable("user_notification_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().unique(),
  email: boolean("email").default(true).notNull(),
  push: boolean("push").default(true).notNull(),
  whatsapp: boolean("whatsapp").default(true).notNull(),
  system: boolean("system").default(true).notNull(),
  security: boolean("security").default(true).notNull(),
  marketing: boolean("marketing").default(true).notNull(),
  product: boolean("product").default(true).notNull(),
  general: boolean("general").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
