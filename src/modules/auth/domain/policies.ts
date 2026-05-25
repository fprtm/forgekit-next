
import { UserRole } from "@/config/roles";
import { Action, AuthUser, ResourceContext } from "./types";

// =========================================================================
// 1. Configurable Security Declarations (Unopinionated & Scalable)
// =========================================================================

/**
 * Centrally managed permissions map.
 * Can be configured dynamically or loaded from an external config/database.
 */
let ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  therapist: [
    "users:read",
    "products:read",
    "products:update",
    "products:delete",
    "appointments:create",
    "appointments:read",
    "appointments:update",
    "appointments:delete",
    "consultation:read",
    "consultation:update",
  ],
  patient: [
    "services:read",
    "schedules:read",
    "appointments:create",
    "appointments:read",
    "appointments:update",
    "appointments:delete",
    "consultation:read",
  ],
  super_admin: ["**"],
  admin: ["**"],
  guest: []
};

/**
 * Roles that automatically bypass all resource ownership checks (Super Admins).
 * Completely configurable to support roles like 'super_admin', 'operator', etc.
 */
let SUPER_ROLES: UserRole[] = ["super_admin"];

// =========================================================================
// 2. Extensible Resource Validator Registry (DDD-Aligned & Modular)
// =========================================================================

export type ResourceValidator = (
  user: AuthUser,
  resource: ResourceContext,
) => boolean;

// Central registry for domain-specific validators
const validators: Record<string, ResourceValidator> = {};

/**
 * Central Policy Registry API.
 * Decouples the Auth core from other module domains.
 */
export const authPolicies = {
  /**
   * Configures the roles to permissions map dynamically.
   */
  setPermissions(permissions: Record<UserRole, string[]>) {
    ROLE_PERMISSIONS = { ...permissions };
  },

  /**
   * Configures roles that bypass resource ownership checks.
   */
  setSuperRoles(roles: UserRole[]) {
    SUPER_ROLES = [...roles];
  },

  /**
   * Registers a domain-specific resource validation rule for a given action.
   * Allows other modules (e.g. Products) to define their own ownership logic.
   */
  registerValidator(action: Action | string, validator: ResourceValidator) {
    validators[action] = validator;
  },

  /**
   * Retrieves a registered validator for an action.
   */
  getValidator(action: string): ResourceValidator | undefined {
    return validators[action];
  },
};

// =========================================================================
// 3. Fallback Resource Ownership Checker (Generic)
// =========================================================================

/**
 * Default fallback ownership checker.
 * Scans standard ownership fields if no specific validator is registered for an action.
 * Returns:
 * - `true` if ownership matches the user.
 * - `false` if ownership does not match the user.
 * - `null` if no ownership fields were found on the resource context.
 */
export function defaultOwnershipChecker(
  user: AuthUser,
  resource: ResourceContext,
): boolean | null {
  const genericOwnershipKeys = [
    "ownerId",
    "userId",
    "sellerId",
    "authorId",
    "createdBy",
  ];
  let foundOwnershipKey = false;

  for (const key of genericOwnershipKeys) {
    const val = resource[key];
    if (typeof val === "string") {
      foundOwnershipKey = true;
      if (val === user.id) {
        return true;
      }
    }
  }

  return foundOwnershipKey ? false : null;
}

// =========================================================================
// 4. Unified Policy Engine (can)
// =========================================================================

/**
 * Single source of truth for authorization checks.
 *
 * Checks if a user has permission to perform an action on a resource.
 *
 * @param user The current authenticated user.
 * @param action The specific action permission to check.
 * @param resourceContext Optional context for resource-level validation.
 * @param customValidator Optional ad-hoc validator function passed directly by the caller.
 * @returns boolean indicating whether the action is authorized.
 * @throws Error if resourceContext is provided but cannot be resolved safely (fail-fast).
 */
export function can(
  user: AuthUser | null | undefined,
  action: Action | string,
  resourceContext?: ResourceContext,
  customValidator?: ResourceValidator,
): boolean {
  if (!user || !user.role) {
    return false;
  }

  // 1. Action Authorization (RBAC Check)
  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions || !permissions.includes(action)) {
    return false;
  }

  // 2. Super Role Bypass Override
  if (SUPER_ROLES.includes(user.role)) {
    return true;
  }

  // 3. Resource Authorization (ABAC Check)
  if (resourceContext) {
    // 3a. Use ad-hoc custom validator if provided directly
    if (customValidator) {
      return customValidator(user, resourceContext);
    }

    // 3b. Use pre-registered domain-specific validator if exists
    const registeredValidator = authPolicies.getValidator(action);
    if (registeredValidator) {
      return registeredValidator(user, resourceContext);
    }

    // 3c. Fallback to default ownership checking for modification actions
    if (action.endsWith(":update") || action.endsWith(":delete")) {
      const checkResult = defaultOwnershipChecker(user, resourceContext);

      if (checkResult === null) {
        // FAIL FAST! Inform developer they missed registration or database columns.
        throw new Error(
          `[Authorization Failure - Fail-Fast Registry] Action '${action}' requires resource validation, but no domain validator has been registered and the provided resource context has no standard ownership keys (ownerId, userId, sellerId, authorId, createdBy). \n\n👉 Solution: Register a custom validator via 'authPolicies.registerValidator("${action}", ...)' or add a valid ownership key to the database table.`,
        );
      }

      return checkResult;
    }
  }

  return true;
}

// =========================================================================
// 5. Plug & Play Module-specific Custom Policies Registry
// =========================================================================
// Register external domain validators dynamically to keep Auth engine decoupled.


