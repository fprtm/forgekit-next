import { NextRequest, NextResponse } from "next/server";
import { RegisterUserHandler } from "@/modules/users/application/use-cases/register-user/register-user.handler";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher";
import { DomainException } from "@/shared/domain/exceptions/domain.exception";

const userRepo = new DrizzleUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const registerUserUC = new RegisterUserHandler(userRepo, passwordHasher);

export class AuthController {
  /**
   * REST API Controller for User Registration.
   * Consumed by external integrators (mobile clients, standard HTTP requests).
   */
  public async register(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();

      const result = await registerUserUC.execute({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      return NextResponse.json({ success: true, data: result }, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof DomainException) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode || 400 }
        );
      }

      console.error("AUTH_CONTROLLER_REGISTER_ERROR", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}

export const authController = new AuthController();
