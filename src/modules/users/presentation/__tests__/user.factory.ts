/**
 * @file user.factory.ts
 * @description Test data generator factory for the Users module.
 * Provides dynamically generated mock user profiles to guarantee zero database collisions in E2E tests and seeders.
 *
 * @module Users/Presentation/Tests/Factory
 */

import { generateUniqueString } from "@/lib/utils";
import { UserRole } from "@/config/roles";

export interface UserFixture {
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Generates a dynamic user fixture with a unique email and name to prevent database collisions.
 * 
 * @param {string} [prefix="User"] - The name prefix for the mock user.
 * @returns {UserFixture} A uniquely populated user fixture.
 */
export function createUserFixture(prefix = "User"): UserFixture {
  const uniqueName = generateUniqueString(prefix);
  
  // Transform unique name into a clean, valid, unique email address string
  const emailSafeString = uniqueName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const uniqueEmail = `test${emailSafeString}@example.com`;

  return {
    name: uniqueName,
    email: uniqueEmail,
    role: "guest",
  };
}
