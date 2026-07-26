import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  isRegistered: boolean("is_registered").notNull().default(false),
  auth0Sub: varchar("auth0_sub", { length: 255 }),
  noShowCount: integer("no_show_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
