import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { services } from "./services";
import { staffMembers } from "./staff-members";

export const waitlistEntries = pgTable("waitlist_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  staffMemberId: uuid("staff_member_id").references(() => staffMembers.id),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  preferredStart: timestamp("preferred_start", { withTimezone: true }),
  preferredEnd: timestamp("preferred_end", { withTimezone: true }),
  notified: varchar("notified", { length: 10 }).notNull().default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
