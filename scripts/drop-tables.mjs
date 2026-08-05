import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  const tables = [
    "working_hours", "waitlist_entries", "staff_services", "blocked_times",
    "audit_logs", "payments", "bookings", "subscriptions", "staff_members",
    "services", "customers", "users", "organizations"
  ];
  for (const t of tables) {
    await sql(`DROP TABLE IF EXISTS ${t} CASCADE`);
  }
  const enums = [
    "booking_channel", "booking_status", "payment_provider", "payment_status",
    "subscription_plan", "subscription_status", "account_status", "user_role"
  ];
  for (const e of enums) {
    await sql(`DROP TYPE IF EXISTS ${e} CASCADE`);
  }
  console.log("Dropped all tables and enums");
}

migrate().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
