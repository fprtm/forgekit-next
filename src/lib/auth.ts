import "server-only"
import NextAuth, { Session, User } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import authConfig from "@/config/auth";
import { db } from "@/db";
import { UserRole } from "@/modules/users/types";
import { JWT } from "next-auth/jwt";


export const { handlers, auth, signIn, signOut } = NextAuth({
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