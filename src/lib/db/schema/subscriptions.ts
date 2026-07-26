import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { pgEnum } from "drizzle-orm/pg-core";
import {
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
} from "@/lib/constants";

export const subscriptionPlanEnum = pgEnum(
  "subscription_plan",
  Object.values(SUBSCRIPTION_PLAN) as [string, ...string[]]
);

export const subscriptionStatusEnum = pgEnum(
  "subscription_status",
  Object.values(SUBSCRIPTION_STATUS) as [string, ...string[]]
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  plan: subscriptionPlanEnum("plan").notNull().default("free"),
  paystackSubscriptionId: varchar("paystack_subscription_id", { length: 255 }),
  paystackCustomerCode: varchar("paystack_customer_code", { length: 255 }),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
