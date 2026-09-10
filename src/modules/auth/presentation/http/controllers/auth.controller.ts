import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, handleApiError } from "@/shared/lib/api-response";
import { RegisterUserHandler } from "@/modules/users/application/use-cases/register-user/register-user.handler";
import { registerUserSchema } from "@/modules/users/application/use-cases/register-user/register-user.command";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher";
import { registerLimiter } from "@/shared/lib/rate-limit";
import { getClientIp } from "@/shared/lib/get-client-ip";
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

      const ip = getClientIp(req.headers);
      const { success } = await registerLimiter.limit(ip);
      if (!success) {
        return apiError("Too many registration attempts. Please try again later.", 429);
      }

      const body = await req.json();
      const parsed = registerUserSchema.safeParse(body);
      if (!parsed.success) {
        return apiError(parsed.error.issues.map((issue) => issue.message).join(", "), 400);
      }

      const result = await registerUserUC.execute(parsed.data);

      return apiSuccess(result, 201);
    } catch (error: unknown) {
      return handleApiError(error, "AUTH_REGISTER");
    }
  }
}

export const authController = new AuthController();
