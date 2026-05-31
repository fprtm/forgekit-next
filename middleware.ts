import NextAuth, { NextAuthRequest } from "next-auth";
import authConfig from "./src/shared/config/auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/auth"];
const authRoutes = ["/login", "/register"];

export default auth((req: NextAuthRequest): NextResponse => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  if (isAuthRoute) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
