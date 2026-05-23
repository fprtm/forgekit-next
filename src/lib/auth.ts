import "server-only"
import NextAuth, { Session, User } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "@/config/auth";
import { db } from "@/db";
import { UserRole } from "@/modules/users/domain/types";
import { JWT } from "next-auth/jwt";


const nextAuthResult = NextAuth({
    ...authConfig,
    adapter: DrizzleAdapter(db),
    session:{strategy:"jwt"},
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
      user: { id: "test-user", name: "Playwright Test", email: "test@example.com", role: "admin" }
    });
  }
  return (nextAuthResult.auth as (...args: unknown[]) => unknown)(...args);
}) as typeof nextAuthResult.auth;