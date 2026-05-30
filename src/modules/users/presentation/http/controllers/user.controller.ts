import { NextRequest, NextResponse } from "next/server";
import { GetUserProfileHandler } from "../../../application/use-cases/get-user-profile/get-user-profile.handler";
import { DrizzleUserRepository } from "../../../infrastructure/database/repositories/drizzle-user.repository";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";
import { auth } from "@/shared/lib/auth";

const userRepo = new DrizzleUserRepository();
const getUserProfileUC = new GetUserProfileHandler(userRepo);

export class UserController {
  /**
   * REST API Controller for fetching user profile.
   * Consumed by external REST clients.
   */
  public async getProfile(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
      // In a real API, authentication would likely use a Bearer token rather than NextAuth session
      // For this boilerplate, we'll try to get the session
      const session = await auth();

      const result = await getUserProfileUC.execute({
        id: params.id,
        currentUser: session?.user
      });

      return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }
      
      console.error("USER_CONTROLLER_GET_PROFILE_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const userController = new UserController();
