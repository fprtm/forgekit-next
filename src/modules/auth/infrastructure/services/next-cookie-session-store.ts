import { cookies } from "next/headers";
import { CookieOptions, ISessionStore } from "../../domain/services/session-store.interface";

export class NextCookieSessionStore implements ISessionStore {
  async setCookie(key: string, value: string, options: CookieOptions): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(key, value, options);
  }

  async getCookie(key: string): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(key)?.value;
  }

  async deleteCookie(key: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(key);
  }
}
