"use server"

import { auth } from "@/shared/lib/auth";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { ImpersonateUserHandler } from "@/modules/auth/application/use-cases/impersonate-user/impersonate-user.handler";
import { can } from "@/modules/auth/domain/policies";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";

const userRepo = new DrizzleUserRepository();
const impersonateUC = new ImpersonateUserHandler(userRepo);

type ActionResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string; data: null };

export async function impersonateUserAction(targetUserId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized", data: null };
    }

    const currentRole = session.user.originalUserRole || session.user.role;
    if (!can({ id: session.user.id, role: currentRole }, "impersonate")) {
      return { success: false, error: "Forbidden: Superadmin permission required", data: null };
    }

    const superAdminId = session.user.originalUserId || session.user.id;

    const result = await impersonateUC.execute({
      superAdminId,
      targetUserId,
    });

    return { success: true, data: result, error: null };
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      console.error("IMPERSONATE_DOMAIN_ERROR", { message: error.message });
      return { success: false, error: error.message, data: null };
    }
    console.error("IMPERSONATE_ACTION_ERROR", error);
    return { success: false, error: "Internal Server Error", data: null };
  }
}

export async function stopImpersonationAction(): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized", data: null };
    }

    if (!session.user.originalUserId) {
      return { success: true, data: { success: true }, error: null };
    }

    const result = await impersonateUC.execute({
      superAdminId: session.user.originalUserId,
      targetUserId: null,
    });

    return { success: true, data: result, error: null };
  } catch (error: unknown) {
    if (error instanceof DomainException) {
      return { success: false, error: error.message, data: null };
    }
    console.error("STOP_IMPERSONATE_ACTION_ERROR", error);
    return { success: false, error: "Internal Server Error", data: null };
  }
}
