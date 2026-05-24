import React from "react";
import { Action, AuthUser, ResourceContext } from "../../../../domain/types";
import { can } from "../../../../domain/policies";

export interface PermissionGateProps {
  action: Action;
  user: AuthUser | null | undefined;
  resource?: ResourceContext;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Reusable UI component that gates rendering of children based on Action/Resource policies.
 * Delegates checks entirely to the Auth Domain Policy engine (`can`).
 */
export function PermissionGate({
  action,
  user,
  resource,
  fallback = null,
  children,
}: PermissionGateProps) {
  const isAllowed = can(user, action, resource);

  if (isAllowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
