import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function verifyCsrfToken(req: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get("authjs.csrf-token");
  const csrfHeader =
    req.headers.get("x-csrf-token") ||
    (await req.clone().json().catch(() => ({}))).csrfToken;

  if (!csrfCookie || !csrfHeader) return false;
  const [token] = csrfCookie.value.split("|");
  return token === csrfHeader;
}
