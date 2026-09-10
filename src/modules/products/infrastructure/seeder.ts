import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { products } from "./database/drizzle/schema";

/**
 * Modular seeder for the Products module.
 * Standardized to export a named function `seed` for the dynamic seed runner.
 * 
 * @param {NodePgDatabase} db - The Drizzle database instance.
 */
export async function seed(db: NodePgDatabase) {
  console.log("📦 [Products] Seeding demo products...");

  const demoProducts = [
    { name: "Premium Laptop", description: "High performance workstation", price: 150000 },
    { name: "Wireless Headphones", description: "Noise-cancelling over-ear headphones", price: 29900 },
    { name: "Mechanical Keyboard", description: "Tactile clicky switches", price: 12000 },
  ];

  // `name` has no unique constraint, so `onConflictDoNothing()` has no conflict target
  // to act on — check for an existing row first, or every re-run of this seeder
  // duplicates the demo catalog.
  for (const item of demoProducts) {
    const [existing] = await db.select().from(products).where(eq(products.name, item.name)).limit(1);
    if (!existing) {
      await db.insert(products).values(item);
    }
  }

  console.log("✅ [Products] Seeding completed!");
  console.log(`   📦 Seeded   : ${demoProducts.length} demo products`);
}
