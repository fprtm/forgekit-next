import { eventDispatcher } from "@/shared/application/services/event-dispatcher.service";
import { IUserRepository } from "@/modules/users/domain/repositories/user-repository.interface";
import { UserImpersonatedEvent, UserImpersonationStoppedEvent } from "@/modules/auth/domain/events/impersonate.events";
import { UnauthorizedException } from "@/shared/domain/exceptions/unauthorized.exception";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { ImpersonateUserCommand } from "./impersonate-user.command";
import { ISessionStore } from "@/modules/auth/domain/services/session-store.interface";

const IMPERSONATE_COOKIE = "impersonate_target";

export class ImpersonateUserHandler {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly sessionStore: ISessionStore
  ) {}

  async execute(command: ImpersonateUserCommand): Promise<{ success: boolean }> {
    // 1. Authenticate & Authorize the caller
    const superAdmin = await this.userRepo.findById(command.superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      throw new UnauthorizedException("Only super_admins are permitted to impersonate other users.");
    }

    if (command.targetUserId) {
      // START IMPERSONATION
      if (command.superAdminId === command.targetUserId) {
        throw new DomainException("You cannot impersonate yourself.", "INVALID_IMPERSONATION", 400);
      }

      const targetUser = await this.userRepo.findById(command.targetUserId);
      if (!targetUser) {
        throw new DomainException("Target user not found.", "USER_NOT_FOUND", 404);
      }

      // Set cookie
      await this.sessionStore.setCookie(IMPERSONATE_COOKIE, targetUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 3600,
      });

      // Dispatch event
      await eventDispatcher.dispatch(new UserImpersonatedEvent(superAdmin.id, targetUser.id));
    } else {
      // STOP IMPERSONATION
      const currentImpersonatingId = await this.sessionStore.getCookie(IMPERSONATE_COOKIE);
      if (!currentImpersonatingId) {
        return { success: true };
      }

      // Clear cookie
      await this.sessionStore.deleteCookie(IMPERSONATE_COOKIE);

      // Dispatch event
      await eventDispatcher.dispatch(new UserImpersonationStoppedEvent(superAdmin.id, currentImpersonatingId));
    }

    return { success: true };
  }
}
