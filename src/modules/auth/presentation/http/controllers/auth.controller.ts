import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response";
import { RegisterUserHandler } from "@/modules/users/application/use-cases/register-user/register-user.handler";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher";
import { registerLimiter } from "@/shared/lib/rate-limit";
import { verifyCsrfToken } from "@/shared/lib/csrf";

const userRepo = new DrizzleUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const registerUserUC = new RegisterUserHandler(userRepo, passwordHasher);

export class AuthController {
  public async register(req: NextRequest): Promise<NextResponse> {
    try {
      if (!(await verifyCsrfToken(req))) {
        return apiError("Invalid CSRF token", 403);
      }

      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const { success } = await registerLimiter.limit(ip);
      if (!success) {
        return apiError("Too many registration attempts. Please try again later.", 429);
      }

      const body = await req.json();

      const result = await registerUserUC.execute({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      return apiSuccess(result, 201);
    } catch (error: unknown) {
      return handleApiError(error, "AUTH_REGISTER");
    }
  }
}

export const authController = new AuthController();
