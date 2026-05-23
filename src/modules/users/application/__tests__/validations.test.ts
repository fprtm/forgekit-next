import { describe, expect, it } from "bun:test";
import { updateUserSchema } from "../validations";

describe("Users Validations", () => {
  describe("updateUserSchema", () => {
    it("should accept valid user update data", () => {
      const validData = {
        name: "Admin User",
        role: "admin",
      };
      
      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid roles", () => {
      const invalidData = {
        name: "Hacker",
        role: "superadmin", // Invalid role
      };
      
      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
