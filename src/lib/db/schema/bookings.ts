import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { services } from "./services";
import { staffMembers } from "./staff-members";
import { customers } from "./customers";
import { pgEnum } from "drizzle-orm/pg-core";
import { BOOKING_STATUS, BOOKING_CHANNEL } from "@/lib/constants";

export const bookingStatusEnum = pgEnum(
  "booking_status",
  Object.values(BOOKING_STATUS) as [string, ...string[]]
);

export const bookingChannelEnum = pgEnum(
  "booking_channel",
  Object.values(BOOKING_CHANNEL) as [string, ...string[]]
);

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  staffMemberId: uuid("staff_member_id").references(() => staffMembers.id),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  channel: bookingChannelEnum("channel").notNull().default("web"),
  idempotencyKey: varchar("idempotency_key", { length: 255 }).unique(),
  depositPaid: boolean("deposit_paid").notNull().default(false),
  notes: text("notes"),
  manageToken: varchar("manage_token", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
