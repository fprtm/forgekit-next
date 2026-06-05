import "server-only"
import NextAuth, { Session, User } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "@/shared/config/auth";
import { db } from "@/db";
import { DrizzleUserRepository } from "@/modules/users/infrastructure/database/repositories/drizzle-user.repository";
import { ValidateCredentialsHandler } from "@/modules/auth/application/use-cases/validate-credentials/validate-credentials.handler";
import { BcryptPasswordHasher } from "@/modules/auth/infrastructure/services/bcrypt-password-hasher";
import { UserRole } from "@/shared/config/roles";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { loginLimiter } from "@/shared/lib/rate-limit";
import { logger } from "@/shared/lib/logger";

const userRepo = new DrizzleUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const validateCredentialsUC = new ValidateCredentialsHandler(userRepo, passwordHasher);

const nextAuthResult = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const ip = request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const { success } = await loginLimiter.limit(ip);
        if (!success) {
          return null;
        }

        const user = await validateCredentialsUC.execute({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT, user: User }) {
      if (user) {
        if (user.id) token.id = user.id
        token.role = user.role
      }

      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const impersonateTarget = cookieStore.get("impersonate_target")?.value;

        const currentRole = (token.originalUserRole as UserRole) || (token.role as UserRole);
        if (impersonateTarget && currentRole === "super_admin") {
          const targetUser = await userRepo.findById(impersonateTarget);
          if (targetUser) {
            if (!token.originalUserId) {
              token.originalUserId = token.id;
              token.originalUserRole = token.role;
            }
            token.id = targetUser.id;
            token.role = targetUser.role;
            token.name = targetUser.name;
            token.email = targetUser.email;
          }
        } else if (!impersonateTarget && token.originalUserId) {
          token.id = token.originalUserId;
          token.role = token.originalUserRole as UserRole;
          delete token.originalUserId;
          delete token.originalUserRole;

          const origUser = await userRepo.findById(token.id as string);
          if (origUser) {
            token.name = origUser.name;
            token.email = origUser.email;
          }
        }
      } catch (e) {
        logger.error({ err: e }, "Error in NextAuth JWT callback");
      }

      return token
    },
    session({ session, token }: { session: Session, token: JWT }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        if (token.originalUserId) {
          session.user.originalUserId = token.originalUserId as string;
          session.user.originalUserRole = token.originalUserRole as UserRole;
        }
      }
      return session
    },
  }
})




export const { handlers, signIn, signOut } = nextAuthResult

export const auth = nextAuthResult.auth;