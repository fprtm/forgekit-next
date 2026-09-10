import { describe, expect, it } from "bun:test";
import {
  can,
  authPolicies,
  getEffectivePermissions,
  matchPermission,
} from "../policies";
import { AuthUser } from "../types";
import { UserRole } from "@/shared/config/roles";
import "@/modules/products/domain/policies";

const DEFAULT_HIERARCHY: Record<UserRole, UserRole[]> = {
  super_admin: ["admin", "user"],
  admin: ["user"],
  user: [],
};

const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["impersonate"],
  admin: [
    "users:create", "users:read", "users:update", "users:delete",
    "settings:read", "settings:write",
  ],
  user: [
    "products:create", "products:read", "products:update", "products:delete",
    "notifications:read", "notifications:write",
  ],
};

describe("Domain Policy Authorization Tests", () => {

  describe("matchPermission (glob matching)", () => {
    it("matches everything with '**'", () => {
      expect(matchPermission("**", "anything")).toBe(true);
      expect(matchPermission("**", "products:delete")).toBe(true);
    });

    it("matches any action within a namespace with 'namespace:*'", () => {
      expect(matchPermission("products:*", "products:read")).toBe(true);
      expect(matchPermission("products:*", "products:delete")).toBe(true);
    });

    it("does not match a different namespace with 'namespace:*'", () => {
      expect(matchPermission("products:*", "users:read")).toBe(false);
    });

    it("matches exact permissions literally", () => {
      expect(matchPermission("products:read", "products:read")).toBe(true);
      expect(matchPermission("products:read", "products:update")).toBe(false);
    });
  });

  describe("getEffectivePermissions (linear hierarchy)", () => {
    it("gives user role only its own permissions", () => {
      const permissions = getEffectivePermissions("user");
      expect(permissions).toEqual(expect.arrayContaining(["products:read", "products:create"]));
      expect(permissions).not.toContain("users:read");
      expect(permissions).not.toContain("impersonate");
    });

    it("gives admin its own permissions plus everything inherited from user", () => {
      const permissions = getEffectivePermissions("admin");
      expect(permissions).toEqual(expect.arrayContaining(["users:read", "settings:write"]));
      expect(permissions).toEqual(expect.arrayContaining(["products:read", "products:update"]));
      expect(permissions).not.toContain("impersonate");
    });

    it("gives super_admin its own permissions plus everything inherited from admin and user", () => {
      const permissions = getEffectivePermissions("super_admin");
      expect(permissions).toEqual(expect.arrayContaining(["impersonate"]));
      expect(permissions).toEqual(expect.arrayContaining(["users:read", "settings:write"]));
      expect(permissions).toEqual(expect.arrayContaining(["products:read", "products:update"]));
    });
  });

  describe("Action Authorization (RBAC)", () => {
    it("should allow admin role to perform all allowed actions, including inherited ones", () => {
      const adminUser: AuthUser = { id: "admin-1", role: "admin" };

      expect(can(adminUser, "users:read")).toBe(true);
      expect(can(adminUser, "users:create")).toBe(true);
      expect(can(adminUser, "users:update")).toBe(true);
      expect(can(adminUser, "users:delete")).toBe(true);
      expect(can(adminUser, "products:create")).toBe(true);
      expect(can(adminUser, "products:read")).toBe(true);
      expect(can(adminUser, "products:update")).toBe(true);
      expect(can(adminUser, "products:delete")).toBe(true);
    });

    it("should allow user role to perform products actions but deny admin-only actions", () => {
      const standardUser: AuthUser = { id: "user-1", role: "user" };

      expect(can(standardUser, "users:create")).toBe(false);
      expect(can(standardUser, "users:read")).toBe(false);
      expect(can(standardUser, "users:update")).toBe(false);
      expect(can(standardUser, "users:delete")).toBe(false);

      expect(can(standardUser, "products:create")).toBe(true);
      expect(can(standardUser, "products:read")).toBe(true);
      expect(can(standardUser, "products:update")).toBe(true);
      expect(can(standardUser, "products:delete")).toBe(true);
    });

    it("should not let user inherit permissions from a higher role", () => {
      const standardUser: AuthUser = { id: "user-1", role: "user" };
      expect(can(standardUser, "settings:write")).toBe(false);
    });

    it("should deny access if user is null, undefined, or has no role", () => {
      expect(can(null, "products:read")).toBe(false);
      expect(can(undefined, "products:read")).toBe(false);
      expect(can({ id: "user-1" } as AuthUser, "products:read")).toBe(false);
    });
  });

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

    it("should allow user to read any product context without ownership check", () => {
      const otherProduct = { id: "prod-1", sellerId: "user-2" };
      expect(can(standardUser, "products:read", otherProduct)).toBe(true);
    });
  });

  describe("Super Admin Override", () => {
    const superAdminUser: AuthUser = { id: "admin-1", role: "super_admin" };

    it("should allow super_admin to bypass ownership constraints on any resource context", () => {
      const otherUserProduct = { id: "prod-1", sellerId: "user-2" };

      expect(can(superAdminUser, "products:update", otherUserProduct)).toBe(true);
      expect(can(superAdminUser, "products:delete", otherUserProduct)).toBe(true);
    });

    it("should allow super_admin an action only granted to admin/user via inheritance (the critical wildcard bug)", () => {
      expect(can(superAdminUser, "products:update")).toBe(true);
      expect(can(superAdminUser, "users:delete")).toBe(true);
    });

    it("should allow super_admin its own exclusive permission", () => {
      expect(can(superAdminUser, "impersonate")).toBe(true);
    });
  });

  describe("Fail-Fast Developer Assistance", () => {
    const standardUser: AuthUser = { id: "user-1", role: "user" };

    it("should throw a descriptive error when resource context lacks standard ownership keys and no validator is registered", () => {
      authPolicies.setPermissions({
        admin: [],
        user: ["mock:update"],
        super_admin: [],
      });

      const invalidContext = { id: "doc-1", title: "Missing Ownership Fields" };

      expect(() => {
        can(standardUser, "mock:update", invalidContext);
      }).toThrow("[Authorization Failure - Fail-Fast Registry]");

      authPolicies.setPermissions(DEFAULT_PERMISSIONS);
      authPolicies.setHierarchy(DEFAULT_HIERARCHY);
    });
  });
});
