import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response";
import { auth } from "@/shared/lib/auth";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { ImpersonateUserHandler } from "@/modules/auth/application/use-cases/impersonate-user/impersonate-user.handler";
import { can } from "@/modules/auth/domain/policies";
import { impersonateLimiter } from "@/shared/lib/rate-limit";
import { verifyCsrfToken } from "@/shared/lib/csrf";

const userRepo = new DrizzleUserRepository();
const impersonateUC = new ImpersonateUserHandler(userRepo);

export class ImpersonateController {
  public async impersonate(req: NextRequest): Promise<NextResponse> {
    try {
      if (!(await verifyCsrfToken(req))) {
        return apiError("Invalid CSRF token", 403);
      }

      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const { success } = await impersonateLimiter.limit(ip);
      if (!success) {
        return apiError("Too many impersonation attempts. Please try again later.", 429);
      }

      const session = await auth();
      if (!session || !session.user) {
        return apiError("Unauthorized", 401);
      }

      const currentRole = session.user.originalUserRole || session.user.role;
      const currentUser = { id: session.user.id, role: currentRole };

      if (!can(currentUser, "impersonate")) {
        return apiError("Forbidden: Superadmin permission required", 403);
      }

      const body = await req.json();
      const targetUserId = body.targetUserId;

      if (!targetUserId) {
        return apiError("targetUserId is required", 400);
      }

      const result = await impersonateUC.execute({
        superAdminId: session.user.originalUserId || session.user.id,
        targetUserId,
      });

      return apiSuccess(result, 200);
    } catch (error: unknown) {
      return handleApiError(error, "IMPERSONATE");
    }
  }

  public async stopImpersonation(req: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth();
      if (!session || !session.user) {
        return apiError("Unauthorized", 401);
      }

      if (!session.user.originalUserId) {
        return apiSuccess({ message: "No active impersonation session" }, 200);
      }

      const result = await impersonateUC.execute({
        superAdminId: session.user.originalUserId,
        targetUserId: null,
      });

      return apiSuccess(result, 200);
    } catch (error: unknown) {
      return handleApiError(error, "STOP_IMPERSONATION");
    }
  }
}

export const impersonateController = new ImpersonateController();
