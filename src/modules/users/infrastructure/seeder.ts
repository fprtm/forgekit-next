import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher";
import { users } from "./database/drizzle/schema";
import { like, or } from "drizzle-orm";

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

  // Remove stale seed data first so fixed IDs are properly applied
  await db.delete(users).where(
    or(like(users.email, "%forgekit.test"), like(users.email, "%@example.com"))
  );

  const passwordHasher = new BcryptPasswordHasher();

  // 1. Define list of users to seed
  const seedUsers = [
    {
      id: "e2e-superadmin",
      name: "E2E Super Admin",
      email: "e2e-superadmin@forgekit.test",
      password: "00superadmin@forgekit.test",
      role: "super_admin" as const,
    },
    {
      id: "e2e-superadmin-2",
      name: "Super Admin Test",
      email: "superadmin@forgekit.test",
      password: "00superadmin@forgekit.test",
      role: "super_admin" as const,
    },
    {
      id: "e2e-admin-1",
      name: "Admin Satu Test",
      email: "admin1@forgekit.test",
      password: "00admin1@forgekit.test",
      role: "admin" as const,
    },
    {
      id: "e2e-admin-2",
      name: "Admin Dua Test",
      email: "admin2@forgekit.test",
      password: "00admin2@forgekit.test",
      role: "admin" as const,
    },
    {
      id: "e2e-user-1",
      name: "User Satu Test",
      email: "user1@forgekit.test",
      password: "00user1@forgekit.test",
      role: "patient" as const,
    },
    {
      id: "e2e-user-2",
      name: "User Dua Test",
      email: "user2@forgekit.test",
      password: "00user2@forgekit.test",
      role: "patient" as const,
    },
    {
      id: "e2e-user-3",
      name: "User Tiga Test",
      email: "user3@forgekit.test",
      password: "00user3@forgekit.test",
      role: "patient" as const,
    },
  ];

  for (const item of seedUsers) {
    const hashedPassword = await passwordHasher.hash(item.password);

    await db
      .insert(users)
      .values({
        ...(item.id ? { id: item.id } : {}),
        name: item.name,
        email: item.email,
        password: hashedPassword,
        role: item.role,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { id: item.id, name: item.name, password: hashedPassword, role: item.role },
      });

    console.log(`   ➡️ Created [${item.role.toUpperCase()}] - Email: ${item.email} (Password: ${item.password})`);
  }

  console.log("✅ [Users] Seeding completed successfully!");
}
