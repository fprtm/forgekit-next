import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "@/modules/users/infrastructure/database/drizzle/schema";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    action: text("action").notNull(),
    entityName: text("entity_name").notNull(),
    entityId: text("entity_id"),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    details: jsonb("details").notNull(),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_id_created_at_idx").on(
      table.actorId,
      table.createdAt,
    ),
    index("audit_logs_entity_name_entity_id_idx").on(
      table.entityName,
      table.entityId,
    ),
  ],
);
