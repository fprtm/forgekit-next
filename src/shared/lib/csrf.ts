import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function verifyCsrfToken(req: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  // Auth.js switches to the `__Host-` prefixed cookie name whenever it detects
  // the request is over HTTPS (every production deployment, any HTTPS tunnel) —
  // check both names or CSRF verification silently fails outside plain HTTP dev.
  const csrfCookie =
    cookieStore.get("__Host-authjs.csrf-token") ?? cookieStore.get("authjs.csrf-token");
  const csrfHeader =
    req.headers.get("x-csrf-token") ||
    (await req.clone().json().catch(() => ({}))).csrfToken;

  if (!csrfCookie || !csrfHeader) return false;
  const [token] = csrfCookie.value.split("|");
  return token === csrfHeader;
}
