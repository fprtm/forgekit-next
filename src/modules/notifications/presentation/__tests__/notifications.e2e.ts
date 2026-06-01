import { test, expect, type APIRequestContext } from "@playwright/test";
import { createNotificationFixture } from "./notification.factory";
import { loginAsSuperAdmin, createAuthenticatedContext } from "@/shared/tests/e2e-helpers";

test.describe.serial("Notifications Sheet E2E", () => {
  let apiContext: APIRequestContext;
  let uniqueTitle: string;
  let uniqueTitle2: string;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await createAuthenticatedContext(playwright, "super_admin");

    await apiContext.delete("/api/notifications");
  });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test("should create notifications via API and open the notification sheet", async ({ page }) => {
    const n1 = createNotificationFixture("E2E Notif A");
    uniqueTitle = n1.title;
    const n2 = createNotificationFixture("E2E Notif B");
    uniqueTitle2 = n2.title;

    const r1 = await apiContext.post("/api/notifications", { data: { title: n1.title, message: n1.message } });
    const r2 = await apiContext.post("/api/notifications", { data: { title: n2.title, message: n2.message } });
    expect([200, 201]).toContain(r1.status());
    expect([200, 201]).toContain(r2.status());

    await page.goto("/d");
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Notifications" }).click();

    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "Notifications" })).toBeVisible();

    await expect(sheet.getByRole("button", { name: new RegExp(uniqueTitle) })).toBeVisible();
    await expect(sheet.getByRole("button", { name: new RegExp(uniqueTitle2) })).toBeVisible();
  });

  test("should show unread count in header", async ({ page }) => {
    await page.goto("/d");
    await page.waitForTimeout(1000);

    const badge = page.getByRole("button", { name: "Notifications" }).locator(".rounded-full");
    await expect(badge).toBeVisible();
    await expect(badge).not.toBeEmpty();
  });

  test("should mark a notification as read when clicked", async ({ page }) => {
    await page.goto("/d");
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Notifications" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    const unreadBtn = sheet.getByRole("button", { name: new RegExp(uniqueTitle), disabled: false });
    await expect(unreadBtn).toBeVisible();
    await unreadBtn.click();

    await expect(sheet.getByRole("button", { name: new RegExp(uniqueTitle), disabled: true })).toBeVisible({ timeout: 5000 });
  });

  test("should mark all as read", async ({ page }) => {
    await page.goto("/d");
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Notifications" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();

    const markAllBtn = sheet.getByRole("button", { name: /mark all read/i });
    await expect(markAllBtn).toBeVisible();
    await markAllBtn.click();

    await expect(sheet.getByRole("button", { name: /mark all read/i })).not.toBeVisible({ timeout: 5000 });

    const allDisabled = sheet.getByRole("button", { disabled: true });
    const count = await allDisabled.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe.serial("Notifications API E2E", () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await createAuthenticatedContext(playwright, "super_admin");
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test("should get notification settings via API", async () => {
    const response = await apiContext.get("/api/notifications/settings");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  test("should update notification settings via API", async () => {
    const response = await apiContext.put("/api/notifications/settings", {
      data: { email: false },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    await apiContext.put("/api/notifications/settings", { data: { email: true } });
  });
});
