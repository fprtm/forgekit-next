import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { ImpersonateUserHandler } from "@/modules/auth/application/use-cases/impersonate-user/impersonate-user.handler";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { can } from "@/modules/auth/domain/policies";

const userRepo = new DrizzleUserRepository();
const impersonateUC = new ImpersonateUserHandler(userRepo);

export class ImpersonateController {
  public async impersonate(req: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      // Check policy "impersonate"
      // Note: We use originalUserRole if present, since a superadmin might already be impersonating someone else
      // but still has their original superadmin identity.
      const currentRole = session.user.originalUserRole || session.user.role;
      const currentUser = { id: session.user.id, role: currentRole };

      if (!can(currentUser, "impersonate")) {
        return NextResponse.json({ success: false, error: "Forbidden: Superadmin permission required" }, { status: 403 });
      }

      const body = await req.json();
      const targetUserId = body.targetUserId;

      if (!targetUserId) {
        return NextResponse.json({ success: false, error: "targetUserId is required" }, { status: 400 });
      }

      const result = await impersonateUC.execute({
        superAdminId: session.user.originalUserId || session.user.id,
        targetUserId,
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }

      console.error("IMPERSONATE_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  public async stopImpersonation(req: NextRequest): Promise<NextResponse> {
    try {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      // If they are not currently impersonating, it's a no-op
      if (!session.user.originalUserId) {
        return NextResponse.json({ success: true, message: "No active impersonation session" }, { status: 200 });
      }

      const result = await impersonateUC.execute({
        superAdminId: session.user.originalUserId,
        targetUserId: null, // stop
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }

      console.error("STOP_IMPERSONATE_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const impersonateController = new ImpersonateController();
