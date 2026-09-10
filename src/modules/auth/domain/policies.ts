
import { UserRole } from "@/shared/config/roles";
import { Action, AuthUser, ResourceContext } from "./types";

let ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  super_admin: ["admin", "user"],
  admin: ["user"],
  user: [],
};

let ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["impersonate"],
  admin: [
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "settings:read",
    "settings:write",
  ],
  user: [
    "products:create",
    "products:read",
    "products:update",
    "products:delete",
    "notifications:read",
    "notifications:write",
  ],
};

export type ResourceValidator = (
  user: AuthUser,
  resource: ResourceContext,
) => boolean;

const validators: Record<string, ResourceValidator> = {};

export function getEffectivePermissions(role: UserRole): string[] {
  const inheritedRoles = ROLE_HIERARCHY[role] ?? [];
  const permissions = new Set<string>(ROLE_PERMISSIONS[role] ?? []);

  for (const inheritedRole of inheritedRoles) {
    for (const permission of ROLE_PERMISSIONS[inheritedRole] ?? []) {
      permissions.add(permission);
    }
  }

  return Array.from(permissions);
}

export function matchPermission(pattern: string, action: string): boolean {
  if (pattern === "**") return true;
  if (pattern.endsWith(":*")) {
    return action.startsWith(pattern.slice(0, -1));
  }
  return pattern === action;
}

/**
 * Roles that sit at the top of the hierarchy (i.e. are not inherited by any
 * other role) bypass ABAC/ownership validation entirely — they can act on
 * any resource. This generalizes the old `SUPER_ROLES` array using the
 * hierarchy structure itself.
 */
function isTopLevelRole(role: UserRole): boolean {
  const allRoles = Object.keys(ROLE_HIERARCHY) as UserRole[];
  const inheritedRoles = new Set<UserRole>();

  for (const parentRole of allRoles) {
    for (const inherited of ROLE_HIERARCHY[parentRole] ?? []) {
      inheritedRoles.add(inherited);
    }
  }

  return !inheritedRoles.has(role);
}

export const authPolicies = {
  setPermissions(permissions: Record<UserRole, string[]>) {
    ROLE_PERMISSIONS = { ...permissions };
  },

  setHierarchy(hierarchy: Record<UserRole, UserRole[]>) {
    ROLE_HIERARCHY = { ...hierarchy };
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

  const effectivePermissions = getEffectivePermissions(user.role);
  const hasMatch = effectivePermissions.some((pattern) =>
    matchPermission(pattern, action),
  );

  if (!hasMatch) {
    return false;
  }

  if (isTopLevelRole(user.role)) {
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
