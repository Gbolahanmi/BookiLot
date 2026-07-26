import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { staffMembers } from "./staff-members";

export const blockedTimes = pgTable("blocked_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  staffMemberId: uuid("staff_member_id")
    .notNull()
    .references(() => staffMembers.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
