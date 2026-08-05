import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync("drizzle/0000_add_missing_columns.sql", "utf-8");

// Split by statement-breakpoint and filter empty
const statements = migration
  .split("--> statement-breakpoint")
  .map(s => s.trim())
  .filter(s => s.length > 0);

async function run() {
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql(stmt);
      console.log(`[${i + 1}/${statements.length}] OK`);
    } catch (e) {
      console.error(`[${i + 1}/${statements.length}] FAIL: ${e.message}`);
    }
  }
  console.log("Migration complete");
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
