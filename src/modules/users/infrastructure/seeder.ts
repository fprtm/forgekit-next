import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as bcrypt from "bcrypt";
import { users } from "./schema";

/**
 * Modular seeder for the Users module.
 * Standardized to export a named function `seed` for the dynamic seed runner.
 *
 * @param {NodePgDatabase} db - The Drizzle database instance.
 */
export async function seed(db: NodePgDatabase) {
  console.log("👥 [Users] Seeding test administrator user...");

  const testEmail = "admin@forgekit.test";
  const testPassword = "00admin@forgekit.test";
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  await db
    .insert(users)
    .values({
      name: "Administrator Test",
      email: testEmail,
      password: hashedPassword,
      role: "admin",
    })
    .onConflictDoNothing();

  console.log("✅ [Users] Seeding completed!");
  console.log(`   📧 Email    : ${testEmail}`);
  console.log(`   🔑 Password : ${testPassword}`);
}
