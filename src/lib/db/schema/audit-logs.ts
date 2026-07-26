import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
