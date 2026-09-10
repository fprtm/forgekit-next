import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { users } from "@/modules/users/infrastructure/database/drizzle/schema";

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 20 }).default("general").notNull(),
    priority: varchar("priority", { length: 20 }).default("medium").notNull(),
    read: boolean("read").default(false).notNull(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_read_created_at_idx").on(
      table.userId,
      table.read,
      table.createdAt,
    ),
  ],
);

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
