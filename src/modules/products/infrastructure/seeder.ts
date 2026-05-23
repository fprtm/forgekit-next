import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { products } from "./schema";

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

  for (const item of demoProducts) {
    await db.insert(products).values(item).onConflictDoNothing();
  }

  console.log("✅ [Products] Seeding completed!");
  console.log(`   📦 Seeded   : ${demoProducts.length} demo products`);
}
