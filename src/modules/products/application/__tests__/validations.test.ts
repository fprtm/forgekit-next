import { describe, expect, it } from "bun:test";
import { createProductSchema, updateProductSchema } from "../validations";

describe("Products Validations", () => {
  describe("createProductSchema", () => {
    it("should accept valid product data", () => {
      const validData = {
        name: "Test Product",
        description: "A great product",
        price: 100, // must be integer
      };
      
      const result = createProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative prices", () => {
      const invalidData = {
        name: "Test Product",
        price: -10,
      };
      
      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Price must be greater than 0");
      }
    });

    it("should reject short names", () => {
      const invalidData = {
        name: "", // empty string fails min(1)
        price: 10,
      };
      
      const result = createProductSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProductSchema", () => {
    it("should accept partial data", () => {
      const validData = {
        price: 150,
      };
      
      const result = updateProductSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
