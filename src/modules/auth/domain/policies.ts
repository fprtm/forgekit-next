
import { UserRole } from "@/shared/config/roles";
import { Action, AuthUser, ResourceContext } from "./types";

let ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["**"],
  admin: [
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "products:create",
    "products:read",
    "products:update",
    "products:delete",
    "notifications:read",
    "notifications:write",
    "settings:read",
    "settings:write",
  ],
  user: [
    "products:read",
    "products:create",
    "products:update",
    "products:delete",
    "notifications:read",
    "notifications:write",
  ],
};

let SUPER_ROLES: UserRole[] = ["super_admin"];

export type ResourceValidator = (
  user: AuthUser,
  resource: ResourceContext,
) => boolean;

const validators: Record<string, ResourceValidator> = {};

export const authPolicies = {
  setPermissions(permissions: Record<UserRole, string[]>) {
    ROLE_PERMISSIONS = { ...permissions };
  },

  setSuperRoles(roles: UserRole[]) {
    SUPER_ROLES = [...roles];
  },

  registerValidator(action: Action | string, validator: ResourceValidator) {
    validators[action] = validator;
  },

  getValidator(action: string): ResourceValidator | undefined {
    return validators[action];
  },
};

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

export function can(
  user: AuthUser | null | undefined,
  action: Action | string,
  resourceContext?: ResourceContext,
  customValidator?: ResourceValidator,
): boolean {
  if (!user || !user.role) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[user.role];
  if (!permissions || !permissions.includes(action)) {
    return false;
  }

  if (SUPER_ROLES.includes(user.role)) {
    return true;
  }

  if (resourceContext) {
    if (customValidator) {
      return customValidator(user, resourceContext);
    }

    const registeredValidator = authPolicies.getValidator(action);
    if (registeredValidator) {
      return registeredValidator(user, resourceContext);
    }

    if (action.endsWith(":update") || action.endsWith(":delete")) {
      const checkResult = defaultOwnershipChecker(user, resourceContext);

      if (checkResult === null) {
        throw new Error(
          `[Authorization Failure - Fail-Fast Registry] Action '${action}' requires resource validation, but no domain validator has been registered and the provided resource context has no standard ownership keys (ownerId, userId, sellerId, authorId, createdBy). \n\n👉 Solution: Register a custom validator via 'authPolicies.registerValidator("${action}", ...)' or add a valid ownership key to the database table.`,
        );
      }

      return checkResult;
    }
  }

  return true;
}
