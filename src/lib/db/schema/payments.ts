import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { bookings } from "./bookings";
import { pgEnum } from "drizzle-orm/pg-core";
import { PAYMENT_PROVIDER, PAYMENT_STATUS } from "@/lib/constants";

export const paymentProviderEnum = pgEnum(
  "payment_provider",
  Object.values(PAYMENT_PROVIDER) as [string, ...string[]]
);

export const paymentStatusEnum = pgEnum(
  "payment_status",
  Object.values(PAYMENT_STATUS) as [string, ...string[]]
);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("NGN"),
  provider: paymentProviderEnum("provider").notNull(),
  providerRef: varchar("provider_ref", { length: 255 }),
  status: paymentStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
