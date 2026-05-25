import { UserRole } from "@/config/roles";

export type Action = 
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete'
  | 'products:create' | 'products:read' | 'products:update' | 'products:delete';

export interface AuthUser {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
}

/**
 * A highly scalable, generic, and type-safe representation of any resource context.
 * Uses 'Record<string, unknown>' instead of 'any' to enforce TypeScript safety 
 * while maintaining 100% independence from any specific domain model or database properties.
 */
export type ResourceContext = Record<string, unknown>;
