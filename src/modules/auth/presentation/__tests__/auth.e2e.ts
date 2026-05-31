import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const TARGET_USER_ID = "e2e-user-1";

test.describe.serial("Auth Bounded Context - Impersonate E2E Flow", () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    const baseURL = `http://localhost:${process.env.PORT || 3000}`;
    apiContext = await playwright.request.newContext({ baseURL });

    const csrfRes = await apiContext.get("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    const loginRes = await apiContext.post("/api/auth/callback/credentials", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: new URLSearchParams({
        csrfToken,
        email: "e2e-superadmin@forgekit.test",
        password: "00superadmin@forgekit.test",
        json: "true",
      }).toString(),
    });

    expect(loginRes.status()).toBe(200);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test("should successfully impersonate the target user", async () => {
    const response = await apiContext.post("/api/auth/impersonate", {
      data: { targetUserId: TARGET_USER_ID },
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);

    const cookies = response.headers()["set-cookie"] ?? "";
    expect(cookies).toContain("impersonate_target");
  });

  test("should stop impersonation successfully", async () => {
    const response = await apiContext.post("/api/auth/stop-impersonation");

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
  });

  test("should reject impersonate requests when targetUserId is missing", async () => {
    const response = await apiContext.post("/api/auth/impersonate", {
      data: {},
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toContain("targetUserId is required");
  });

  test("should reject impersonate when target user does not exist", async () => {
    const response = await apiContext.post("/api/auth/impersonate", {
      data: { targetUserId: "non-existent-user-id" },
    });

    expect(response.status()).toBe(404);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toContain("Target user not found");
  });

  test("should return success on stop-impersonation when no active session", async () => {
    const response = await apiContext.post("/api/auth/stop-impersonation");

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
  });
});

test.describe.serial("Auth UI - Impersonation via Users Table", () => {
  test("should impersonate a user from the table and stop via banner", async ({ page }) => {
    // 1. Login as super_admin via browser
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("e2e-superadmin@forgekit.test");
    await page.getByLabel("Password").fill("00superadmin@forgekit.test");
    await page.getByRole("button", { name: "Sign In with Email" }).click();
    await page.waitForURL("/d");

    // 2. Navigate to users list
    await page.goto("/d/users");

    // 3. Find target user row and click Impersonate
    const targetRow = page.locator("tr").filter({ hasText: "User Satu Test" });
    const impersonateBtn = targetRow.getByRole("button", { name: "Impersonate" });
    await expect(impersonateBtn).toBeVisible();
    await impersonateBtn.click();

    // 4. Should redirect to /d and show impersonation banner
    await page.waitForURL("/d");
    const banner = page.getByText(/You are impersonating/);
    await expect(banner).toBeVisible({ timeout: 10000 });
    await expect(banner).toContainText("User Satu Test");

    // 5. Stop impersonating via the banner button
    const stopBtn = page.getByRole("button", { name: "Stop Impersonating" });
    await expect(stopBtn).toBeVisible({ timeout: 10000 });
    await stopBtn.click();

    // 6. Verify banner is gone
    await expect(page.getByText(/You are impersonating/)).not.toBeVisible({ timeout: 10000 });
  });
});
