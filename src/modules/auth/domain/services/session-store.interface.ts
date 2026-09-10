export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
}

/**
 * Abstracts cookie/session storage (e.g. next/headers `cookies()`) so
 * application/domain code never imports framework-specific APIs directly.
 */
export interface ISessionStore {
  setCookie(key: string, value: string, options: CookieOptions): Promise<void>;
  getCookie(key: string): Promise<string | undefined>;
  deleteCookie(key: string): Promise<void>;
}
