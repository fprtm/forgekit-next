/**
 * @file product-factory.ts
 * @description Test data generator factory for the Products module.
 * Provides dynamically generated mock data to guarantee zero database collisions in E2E tests and seeders.
 *
 * @module Products/Presentation/Tests/Factory
 */

import { generateUniqueString } from "@/lib/utils";

export interface ProductFixture {
  name: string;
  price: string;
  description: string;
}

/**
 * Generates a dynamic product fixture using the global unique string generator.
 * 
 * @param {string} [prefix="Product"] - The name prefix for the product.
 * @returns {ProductFixture} A uniquely populated product fixture.
 */
export function createProductFixture(prefix = "Product"): ProductFixture {
  return {
    name: generateUniqueString(prefix),
    price: "15000",
    description: "Generated dynamically via Product Factory for testing and seeding.",
  };
}
