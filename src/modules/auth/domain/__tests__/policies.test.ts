import { describe, expect, it } from "bun:test";
import { can, authPolicies } from "../policies";
import { AuthUser } from "../types";
import "@/modules/products/domain/policies";

describe("Domain Policy Authorization Tests", () => {

  describe("Action Authorization (RBAC)", () => {
    it("should allow admin role to perform all actions (wildcard)", () => {
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

    it("should allow therapist role to perform allowed actions but deny admin-only actions", () => {
      const therapistUser: AuthUser = { id: "therapist-1", role: "therapist" };

      expect(can(therapistUser, "users:read")).toBe(true);
      expect(can(therapistUser, "users:create")).toBe(false);
      expect(can(therapistUser, "products:read")).toBe(true);
      expect(can(therapistUser, "products:update")).toBe(true);
      expect(can(therapistUser, "appointments:create")).toBe(true);
      expect(can(therapistUser, "appointments:read")).toBe(true);
      expect(can(therapistUser, "consultation:read")).toBe(true);
    });

    it("should deny access if user is null, undefined, or has no role", () => {
      expect(can(null, "products:read")).toBe(false);
      expect(can(undefined, "products:read")).toBe(false);
      expect(can({ id: "user-1" } as AuthUser, "products:read")).toBe(false);
    });
  });

  describe("Resource-Level Context Authorization (ABAC)", () => {
    const therapistUser: AuthUser = { id: "therapist-1", role: "therapist" };

    it("should allow a user to update or delete a product they own", () => {
      const productContext = { id: "prod-1", sellerId: "therapist-1" };

      expect(can(therapistUser, "products:update", productContext)).toBe(true);
      expect(can(therapistUser, "products:delete", productContext)).toBe(true);
    });

    it("should deny a user from updating or deleting a product owned by someone else", () => {
      const otherUserProduct = { id: "prod-1", sellerId: "other-2" };

      expect(can(therapistUser, "products:update", otherUserProduct)).toBe(false);
      expect(can(therapistUser, "products:delete", otherUserProduct)).toBe(false);
    });

    it("should work with alternative owner key mappings like userId or ownerId", () => {
      const contextWithUserId = { id: "prod-1", userId: "therapist-1" };
      const contextWithOwnerId = { id: "prod-1", ownerId: "therapist-1" };
      const contextWithOtherUserId = { id: "prod-1", userId: "other-2" };

      expect(can(therapistUser, "products:update", contextWithUserId)).toBe(true);
      expect(can(therapistUser, "products:update", contextWithOwnerId)).toBe(true);
      expect(can(therapistUser, "products:update", contextWithOtherUserId)).toBe(false);
    });

    it("should allow user to read any product context without ownership check", () => {
      const otherProduct = { id: "prod-1", sellerId: "other" };
      expect(can(therapistUser, "products:read", otherProduct)).toBe(true);
    });
  });

  describe("Super Admin Override", () => {
    const superAdminUser: AuthUser = { id: "admin-1", role: "super_admin" };

    it("should allow super_admin to bypass ownership constraints on any resource context", () => {
      const otherUserProduct = { id: "prod-1", sellerId: "other" };

      expect(can(superAdminUser, "products:update", otherUserProduct)).toBe(true);
      expect(can(superAdminUser, "products:delete", otherUserProduct)).toBe(true);
    });
  });

  describe("Fail-Fast Developer Assistance", () => {
    const therapistUser: AuthUser = { id: "therapist-1", role: "therapist" };

    it("should throw a descriptive error when resource context lacks standard ownership keys and no validator is registered", () => {
      authPolicies.setPermissions({
        therapist: ["mock:update"],
        patient: [],
        super_admin: ["**"],
        admin: ["**"],
        guest: [],
      });

      const invalidContext = { id: "doc-1", title: "Missing Ownership Fields" };

      expect(() => {
        can(therapistUser, "mock:update", invalidContext);
      }).toThrow("[Authorization Failure - Fail-Fast Registry]");

      authPolicies.setPermissions({
        therapist: [
          "users:read",
          "products:read", "products:update", "products:delete",
          "appointments:create", "appointments:read", "appointments:update", "appointments:delete",
          "consultation:read", "consultation:update",
          "notifications:read", "notifications:write",
          "settings:read", "settings:write",
        ],
        patient: [
          "services:read", "schedules:read",
          "appointments:create", "appointments:read", "appointments:update", "appointments:delete",
          "consultation:read",
          "notifications:read", "notifications:write",
        ],
        super_admin: ["**"],
        admin: ["**"],
        guest: [],
      });
    });
  });
});
