import { AuthUser } from "@/modules/auth/domain/types"

/**
 * Base contract for any application command that mutates state.
 * `user` is required (not optional) so TypeScript enforces, at compile time,
 * that every caller has resolved an authenticated session before invoking
 * a mutation handler. This removes the need for `if (currentUser)` runtime
 * guards inside handlers — authorization checks (`can()`) can be called
 * unconditionally.
 *
 * Read-only (query) commands should NOT extend this interface — they keep
 * `user?: AuthUser` optional to support anonymous/filtered reads.
 */
export interface AuthenticatedCommand {
  user: AuthUser
}
