import { pgTable, uuid } from "drizzle-orm/pg-core";
import { staffMembers } from "./staff-members";
import { services } from "./services";

export const staffServices = pgTable("staff_services", {
  staffMemberId: uuid("staff_member_id")
    .notNull()
    .references(() => staffMembers.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
});
