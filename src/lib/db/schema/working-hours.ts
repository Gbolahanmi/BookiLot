import { pgTable, uuid, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { staffMembers } from "./staff-members";

export const workingHours = pgTable("working_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  staffMemberId: uuid("staff_member_id").references(() => staffMembers.id, {
    onDelete: "cascade",
  }),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sun, 6=Sat
  startTime: varchar("start_time", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("end_time", { length: 5 }).notNull(), // "17:00"
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
