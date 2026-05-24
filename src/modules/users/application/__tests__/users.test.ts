/**
 * @file users.test.ts
 * @description Consolidated Unit & Validation tests for the Users module.
 * This file verifies user input schemas (Zod) and Application Services orchestration using Bun Test.
 * It uses repository mocking to ensure the business logic is tested in absolute isolation.
 * 
 * @module Users/Application/Tests
 */

import { describe, expect, it, mock, beforeEach } from "bun:test";

// Mock server-only to prevent client component errors in tests
mock.module("server-only", () => { return {} });

import { updateUserSchema, createUserSchema } from "../validations";
import { UsersService } from "../services";
import { UsersRepository } from "../../infrastructure/repository";

// =========================================================================
// Infrastructure Layer Mocking
// =========================================================================

/**
 * Mock the UsersRepository database infrastructure.
 * This isolates the Application layer from needing an active database connection.
 */
mock.module("../../infrastructure/repository", () => {
  return {
    UsersRepository: {
      findMany: mock(),
      findById: mock(),
      update: mock(),
      delete: mock(),
      create: mock(),
    }
  };
});

type MockedFunction<T extends (...args: never[]) => unknown> = T & {
  mockClear: () => void;
  mockReset: () => void;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => void;
};

const mockFindMany = UsersRepository.findMany as unknown as MockedFunction<typeof UsersRepository.findMany>;
const mockFindById = UsersRepository.findById as unknown as MockedFunction<typeof UsersRepository.findById>;
const mockUpdate = UsersRepository.update as unknown as MockedFunction<typeof UsersRepository.update>;
const mockDelete = UsersRepository.delete as unknown as MockedFunction<typeof UsersRepository.delete>;
const mockCreate = UsersRepository.create as unknown as MockedFunction<typeof UsersRepository.create>;

// =========================================================================
// Main Test Suites
// =========================================================================

describe("Users Module Unit Tests", () => {
  
  beforeEach(() => {
    // Clear invocation counters and histories before each test run
    mockFindMany.mockClear();
    mockFindById.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
    mockCreate.mockClear();
  });

  /**
   * @suite Validations (Zod Schemas)
   * @description Verifies Zod validation schemas for formatting, fields, and roles constraints.
   */
  describe("Validations (Zod Schemas)", () => {
    
    describe("updateUserSchema", () => {
      /**
       * Test valid user profile update payload.
       */
      it("should accept valid user update data", () => {
        const validData = {
          name: "Admin User",
          role: "admin" as const,
        };
        
        const result = updateUserSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      /**
       * Test invalid roles constraint (business rule: roles must be 'admin' or 'user').
       */
      it("should reject invalid roles", () => {
        const invalidData = {
          name: "Hacker",
          role: "superadmin", // Invalid role outside UserRole enum
        };
        
        const result = updateUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe("createUserSchema", () => {
      /**
       * Test valid user creation payload.
       */
      it("should accept valid user creation data", () => {
        const validData = {
          name: "New User",
          email: "newuser@example.com",
          role: "user" as const,
        };
        
        const result = createUserSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      /**
       * Test invalid email formatting.
       */
      it("should reject invalid email formatting", () => {
        const invalidData = {
          name: "New User",
          email: "invalid-email",
          role: "user" as const,
        };
        
        const result = createUserSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  /**
   * @suite Application Services
   * @description Verifies business workflow orchestration, data masking, and error handling inside UsersService.
   */
  describe("Application Services", () => {
    
    /**
     * Test retrieving all users (masks emailVerified date for safety).
     */
    it("should get all users and mask emailVerified", async () => {
      const mockUsers = [
        { id: "1", name: "User1", email: "user1@test.com", emailVerified: new Date(), image: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date() }
      ];
      mockFindMany.mockResolvedValue(mockUsers);

      const result = await UsersService.getUsers();
      
      // Check that emailVerified is mapped to null for safety on client payloads
      expect(result[0].emailVerified).toBeNull();
      expect(result[0].email).toBe("user1@test.com");
      expect(UsersRepository.findMany).toHaveBeenCalled();
    });

    /**
     * Test creating a user profile.
     */
    it("should create a user profile successfully", async () => {
      const input = { name: "New User", email: "newuser@example.com", role: "user" as const };
      const mockUser = { id: "2", ...input, emailVerified: new Date(), image: null, password: null, createdAt: new Date(), updatedAt: new Date() };
      mockCreate.mockResolvedValue(mockUser);

      const result = await UsersService.createUser(input);
      
      expect(result.emailVerified).toBeNull();
      expect(result.name).toBe("New User");
      expect(UsersRepository.create).toHaveBeenCalled();
    });

    /**
     * Test retrieving a single user profile (masks emailVerified date for safety).
     */
    it("should get a single user profile and mask emailVerified", async () => {
      const mockUser = { id: "1", name: "User1", email: "user1@test.com", emailVerified: new Date(), image: null, password: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date() };
      mockFindById.mockResolvedValue(mockUser);

      const result = await UsersService.getUserProfile("1");
      
      expect(result.emailVerified).toBeNull();
      expect(result.name).toBe("User1");
    });

    /**
     * Test throwing error if the targeted user profile does not exist.
     */
    it("should throw error if user not found", async () => {
      mockFindById.mockResolvedValue(null);
      expect(UsersService.getUserProfile("99")).rejects.toThrow("User not found");
    });
  });
});
