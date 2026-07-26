import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  bufferMinutes: integer("buffer_minutes").notNull().default(0),
  depositRequired: boolean("deposit_required").notNull().default(false),
  depositAmountCents: integer("deposit_amount_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
