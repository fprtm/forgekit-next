import { describe, expect, it } from "bun:test";
import { can, authPolicies } from "../policies";
import { AuthUser } from "../types";
import "@/modules/products/domain/policies";

describe("Domain Policy Authorization Tests", () => {
  
  // 1. Action Authorization Tests
  describe("Action Authorization (RBAC)", () => {
    it("should allow admin role to perform allowed actions but deny users modifications", () => {
      const adminUser: AuthUser = { id: "admin-1", role: "admin" };
      
      expect(can(adminUser, "users:read")).toBe(true);
      expect(can(adminUser, "users:create")).toBe(false);
      expect(can(adminUser, "users:update")).toBe(false);
      expect(can(adminUser, "users:delete")).toBe(false);
      expect(can(adminUser, "products:create")).toBe(true);
      expect(can(adminUser, "products:read")).toBe(true);
      expect(can(adminUser, "products:update")).toBe(true);
      expect(can(adminUser, "products:delete")).toBe(true);
    });

    it("should allow user role to perform products actions but deny users actions", () => {
      const standardUser: AuthUser = { id: "user-1", role: "user" };

      // Denied actions
      expect(can(standardUser, "users:create")).toBe(false);
      expect(can(standardUser, "users:read")).toBe(false);
      expect(can(standardUser, "users:update")).toBe(false);
      expect(can(standardUser, "users:delete")).toBe(false);

      // Allowed actions
      expect(can(standardUser, "products:create")).toBe(true);
      expect(can(standardUser, "products:read")).toBe(true);
      expect(can(standardUser, "products:update")).toBe(true);
      expect(can(standardUser, "products:delete")).toBe(true);
    });

    it("should deny access if user is null, undefined, or has no role", () => {
      expect(can(null, "products:read")).toBe(false);
      expect(can(undefined, "products:read")).toBe(false);
      expect(can({ id: "user-1", role: "" }, "products:read")).toBe(false);
    });
  });

  // 2. Resource Context & Ownership Authorization Tests
  describe("Resource-Level Context Authorization (ABAC)", () => {
    const standardUser: AuthUser = { id: "user-1", role: "user" };
    
    it("should allow a user to update or delete a product they own", () => {
      const productContext = { id: "prod-1", sellerId: "user-1" };

      expect(can(standardUser, "products:update", productContext)).toBe(true);
      expect(can(standardUser, "products:delete", productContext)).toBe(true);
    });

    it("should deny a user from updating or deleting a product owned by someone else", () => {
      const otherUserProduct = { id: "prod-1", sellerId: "user-2" };

      expect(can(standardUser, "products:update", otherUserProduct)).toBe(false);
      expect(can(standardUser, "products:delete", otherUserProduct)).toBe(false);
    });

    it("should work with alternative owner key mappings like userId or ownerId", () => {
      const contextWithUserId = { id: "prod-1", userId: "user-1" };
      const contextWithOwnerId = { id: "prod-1", ownerId: "user-1" };
      const contextWithOtherUserId = { id: "prod-1", userId: "user-2" };

      expect(can(standardUser, "products:update", contextWithUserId)).toBe(true);
      expect(can(standardUser, "products:update", contextWithOwnerId)).toBe(true);
      expect(can(standardUser, "products:update", contextWithOtherUserId)).toBe(false);
    });

    it("should allow standard user to read any product context without ownership check", () => {
      const otherProduct = { id: "prod-1", sellerId: "user-2" };
      expect(can(standardUser, "products:read", otherProduct)).toBe(true);
    });
  });

  // 3. Super Admin Override
  describe("Super Admin Override", () => {
    const superAdminUser: AuthUser = { id: "admin-1", role: "super_admin" };

    it("should allow super_admin to bypass ownership constraints on any resource context", () => {
      const otherUserProduct = { id: "prod-1", sellerId: "user-2" };

      expect(can(superAdminUser, "products:update", otherUserProduct)).toBe(true);
      expect(can(superAdminUser, "products:delete", otherUserProduct)).toBe(true);
    });
  });

  // 4. Fail-Fast Developer Assistance
  describe("Fail-Fast Developer Assistance", () => {
    const standardUser: AuthUser = { id: "user-1", role: "user" };

    it("should throw a descriptive error when resource context lacks standard ownership keys and no validator is registered", () => {
      // 1. Temporarily register mock permission to pass RBAC step
      authPolicies.setPermissions({
        user: ["mock:update"]
      });

      const invalidContext = { id: "doc-1", title: "Missing Ownership Fields" };
      
      expect(() => {
        can(standardUser, "mock:update", invalidContext);
      }).toThrow("[Authorization Failure - Fail-Fast Registry]");

      // 2. Restore standard permissions
      authPolicies.setPermissions({
        super_admin: [
          "users:read", "users:update", "users:create", "users:delete",
          "products:create", "products:read", "products:update", "products:delete",
        ],
        admin: [
          "users:read",
          "products:create", "products:read", "products:update", "products:delete",
        ],
        user: [
          "products:read", "products:create", "products:update", "products:delete",
        ],
      });
    });
  });
});
