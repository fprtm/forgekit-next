import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { notifications } from "./database/drizzle/schema";

export async function seed(db: NodePgDatabase) {
  console.log("🔔 [Notifications] Seeding demo notifications...");

  const demoNotifications = [
    {
      userId: "seed-default-user",
      title: "Welcome to ForgeKit!",
      message: "Thank you for joining our platform. Explore the dashboard to get started.",
      read: false,
    },
    {
      userId: "seed-default-user",
      title: "Security Alert: New Login",
      message: "Your account was logged in from a new device. If this wasn't you, please contact support.",
      read: false,
    },
    {
      userId: "seed-default-user",
      title: "Product Created Successfully",
      message: "Your product 'Premium Laptop' has been created and is now visible in the marketplace.",
      read: true,
    },
  ];

  for (const item of demoNotifications) {
    await db.insert(notifications).values(item).onConflictDoNothing();
  }

  console.log("✅ [Notifications] Seeding completed!");
  console.log(`   🔔 Seeded   : ${demoNotifications.length} demo notifications`);
}
