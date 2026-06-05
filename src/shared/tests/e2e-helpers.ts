import { expect, type Page, type APIRequestContext } from "@playwright/test";

type TestRole = "super_admin" | "admin" | "user";

interface TestCredentials {
  email: string;
  password: string;
}

const TEST_CREDENTIALS: Record<TestRole, TestCredentials> = {
  super_admin: {
    email: "e2e-superadmin@forgekit.test",
    password: "00superadmin@forgekit.test",
  },
  admin: {
    email: "admin1@forgekit.test",
    password: "00admin1@forgekit.test",
  },
  user: {
    email: "user1@forgekit.test",
    password: "00user1@forgekit.test",
  },
};

export function getCredentials(role: TestRole): TestCredentials {
  return TEST_CREDENTIALS[role];
}

/**
 * Logs in via browser UI using the specified role.
 * Uses fill() (single-shot) instead of pressSequentially to avoid slowMo per-character overhead
 * pushing the beforeEach hook past the test timeout while the dev server compiles /d.
 */
export async function loginAs(page: Page, role: TestRole) {
  const creds = TEST_CREDENTIALS[role];
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: "Sign In with Email" }).click();
  await expect(page).toHaveURL(/.*\/d/, { timeout: 30000 });
}

export async function loginAsSuperAdmin(page: Page) {
  return loginAs(page, "super_admin");
}

export async function loginAsAdmin(page: Page) {
  return loginAs(page, "admin");
}

export async function loginAsUser(page: Page) {
  return loginAs(page, "user");
}

/**
 * Creates an authenticated API context for programmatic requests.
 * Uses CSRF token flow to authenticate via credentials.
 */
export async function createAuthenticatedContext(
  playwright: { request: { newContext: (options?: { baseURL?: string }) => Promise<APIRequestContext> } },
  role: TestRole,
): Promise<APIRequestContext> {
  const creds = TEST_CREDENTIALS[role];
  const baseURL = `http://localhost:${process.env.PORT || 3000}`;
  const context = await playwright.request.newContext({ baseURL });

  const csrfRes = await context.get("/api/auth/csrf");
  const { csrfToken } = await csrfRes.json();

  const loginRes = await context.post("/api/auth/callback/credentials", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: new URLSearchParams({
      csrfToken,
      email: creds.email,
      password: creds.password,
      json: "true",
    }).toString(),
  });

  expect(loginRes.status()).toBe(200);
  return context;
}
