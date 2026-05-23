/**
 * @file products.test.ts
 * @description Consolidated Unit & Validation tests for the Products module.
 * This file verifies both input data schemas (Zod) and Application Services orchestration using Bun Test.
 * It uses repository mocking to ensure the business logic is tested in absolute isolation.
 * 
 * @module Products/Application/Tests
 */

import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

import { createProductSchema, updateProductSchema } from "../validations";
import { ProductsService } from "../services";
import { ProductsRepository } from "../../infrastructure/repository";

// =========================================================================
// Infrastructure Layer Mocking
// =========================================================================

/**
 * Mock the ProductsRepository database infrastructure.
 * This isolates the Application layer from needing an active database connection.
 */
mock.module("../../infrastructure/repository", () => {
  return {
    ProductsRepository: {
      findMany: mock(),
      create: mock(),
      update: mock(),
      delete: mock(),
    }
  };
});

type MockedFunction<T extends (...args: never[]) => unknown> = T & {
  mockClear: () => void;
  mockReset: () => void;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => void;
};

const mockFindMany = ProductsRepository.findMany as unknown as MockedFunction<typeof ProductsRepository.findMany>;
const mockCreate = ProductsRepository.create as unknown as MockedFunction<typeof ProductsRepository.create>;
const mockUpdate = ProductsRepository.update as unknown as MockedFunction<typeof ProductsRepository.update>;
const mockDelete = ProductsRepository.delete as unknown as MockedFunction<typeof ProductsRepository.delete>;

// =========================================================================
// Main Test Suites
// =========================================================================

describe("Products Module Unit Tests", () => {
  
  beforeEach(() => {
    // Clear invocation counters and histories before each test run
    mockFindMany.mockClear();
    mockCreate.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
  });

  /**
   * @suite Validations (Zod Schemas)
   * @description Verifies Zod validation schemas for format, business rules, and constraints.
   */
  describe("Validations (Zod Schemas)", () => {
    
    describe("createProductSchema", () => {
      /**
       * Test valid product payload.
       */
      it("should accept valid product data", () => {
        const validData = {
          name: "Test Product",
          description: "A great product",
          price: 100,
        };
        
        const result = createProductSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      /**
       * Test negative price constraint (business rule: price > 0).
       */
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

      /**
       * Test minimum name length constraint.
       */
      it("should reject short names", () => {
        const invalidData = {
          name: "",
          price: 10,
        };
        
        const result = createProductSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe("updateProductSchema", () => {
      /**
       * Test partial update payloads (all fields are optional on updates).
       */
      it("should accept partial data", () => {
        const validData = {
          price: 150,
        };
        
        const result = updateProductSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  /**
   * @suite Application Services
   * @description Verifies business workflow orchestration, error handling, and formatting inside ProductsService.
   */
  describe("Application Services", () => {
    
    /**
     * Test retrieving all products.
     */
    it("should get all products", async () => {
      const mockProducts = [
        { id: "1", name: "P1", description: null, price: 10, createdAt: new Date(), updatedAt: new Date() }
      ];
      mockFindMany.mockResolvedValue(mockProducts);

      const result = await ProductsService.getProducts();
      expect(result).toEqual(mockProducts);
      expect(ProductsRepository.findMany).toHaveBeenCalled();
    });

    /**
     * Test creating a product with valid input.
     */
    it("should create a product with valid data", async () => {
      const input = { name: "New Product", price: 50 };
      const mockCreated = { id: "2", ...input, description: null, createdAt: new Date(), updatedAt: new Date() };
      
      mockCreate.mockResolvedValue(mockCreated);

      const result = await ProductsService.createProduct(input);
      expect(result).toEqual(mockCreated);
      expect(ProductsRepository.create).toHaveBeenCalled();
    });

    /**
     * Test throwing validation errors for bad input before repository call.
     */
    it("should throw error when creating product with invalid data", async () => {
      const input = { name: "", price: -5 };
      
      expect(ProductsService.createProduct(input)).rejects.toThrow();
      expect(ProductsRepository.create).not.toHaveBeenCalled();
    });
  });
});
