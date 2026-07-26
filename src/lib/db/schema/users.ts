import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const userRoleEnum = pgEnum("user_role", ["owner", "staff", "super_admin"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  auth0Sub: varchar("auth0_sub", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: userRoleEnum("role").notNull().default("owner"),
  organizationId: uuid("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
