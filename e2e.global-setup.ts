import * as fs from "fs";
import * as path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { seed } from "./src/modules/users/infrastructure/seeder";

/**
 * Playwright Global Setup
 * Seeds the database with known test users before E2E tests run.
 * Uses a fixed super_admin ID ("e2e-superadmin") so the Playwright auth() mock
 * can reference a real user in the database for impersonation tests.
 */
export default async function globalSetup() {
  console.log("\n[E2E Global Setup] Seeding test database...");

  // 1. Load env variables from .env.local (same pattern as scripts/seed.ts)
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const parts = trimmed.split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/(^['"]|['"]$)/g, "");
      process.env[key] = val;
    });
  }

  // 2. Connect to database and run seeder
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[E2E Global Setup] DATABASE_URL is not defined. Skipping seed.");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  try {
    await seed(db);
    console.log("[E2E Global Setup] Database seeded successfully.\n");
  } catch (error) {
    console.error("[E2E Global Setup] Seeding failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
