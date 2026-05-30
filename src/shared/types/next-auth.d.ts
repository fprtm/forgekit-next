import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "@/modules/users/domain/entities/user.entity";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      originalUserId?: string;
      originalUserRole?: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    originalUserId?: string;
    originalUserRole?: UserRole;
  }
}