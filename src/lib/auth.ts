import "server-only"
import NextAuth, { Session, User } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "@/config/auth";
import { db } from "@/db";
import { UserRole } from "@/config/roles";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { AuthService } from "@/modules/auth/application/services";

const nextAuthResult = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db),
    session:{strategy:"jwt"},
    providers: [
      ...authConfig.providers,
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await AuthService.validateCredentials({
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
    jwt({ token, user } : {token: JWT, user:User}) {
      if (user) {
        token.id = user.id
        token.role = user.role as UserRole
      }
      return token
    },
    session({ session, token } : {session: Session, token: JWT}) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
}
})

export const { handlers, signIn, signOut } = nextAuthResult

export const auth = ((...args: unknown[]) => {
  if (process.env.TEST_ENV === "playwright") {
    return Promise.resolve({
      user: { id: "test-user", name: "Playwright Test", email: "test@example.com", role: "super_admin" }
    });
  }
  return (nextAuthResult.auth as (...args: unknown[]) => unknown)(...args);
}) as typeof nextAuthResult.auth;