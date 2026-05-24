import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as bcrypt from "bcrypt";
import { users } from "./schema";

/**
 * Modular seeder for the Users module.
 * Standardized to seed:
 * - 1 Super Admin
 * - 2 Admins
 * - 3 Standard Users
 *
 * @param {NodePgDatabase} db - The Drizzle database instance.
 */
export async function seed(db: NodePgDatabase) {
  console.log("👥 [Users] Seeding test database users...");

  const saltRounds = 10;

  // 1. Define list of users to seed
  const seedUsers = [
    // Super Admin (1)
    {
      name: "Super Admin Test",
      email: "superadmin@forgekit.test",
      password: "00superadmin@forgekit.test",
      role: "super_admin" as const,
    },
    // Admins (2)
    {
      name: "Admin Satu Test",
      email: "admin1@forgekit.test",
      password: "00admin1@forgekit.test",
      role: "admin" as const,
    },
    {
      name: "Admin Dua Test",
      email: "admin2@forgekit.test",
      password: "00admin2@forgekit.test",
      role: "admin" as const,
    },
    // Users (3)
    {
      name: "User Satu Test",
      email: "user1@forgekit.test",
      password: "00user1@forgekit.test",
      role: "user" as const,
    },
    {
      name: "User Dua Test",
      email: "user2@forgekit.test",
      password: "00user2@forgekit.test",
      role: "user" as const,
    },
    {
      name: "User Tiga Test",
      email: "user3@forgekit.test",
      password: "00user3@forgekit.test",
      role: "user" as const,
    },
  ];

  for (const item of seedUsers) {
    const hashedPassword = await bcrypt.hash(item.password, saltRounds);

    await db
      .insert(users)
      .values({
        name: item.name,
        email: item.email,
        password: hashedPassword,
        role: item.role,
      })
      .onConflictDoNothing();

    console.log(`   ➡️ Created [${item.role.toUpperCase()}] - Email: ${item.email} (Password: ${item.password})`);
  }

  console.log("✅ [Users] Seeding completed successfully!");
}
