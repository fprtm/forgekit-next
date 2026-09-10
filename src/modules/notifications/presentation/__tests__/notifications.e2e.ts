import { test, expect, type APIRequestContext } from "@playwright/test";
import { createNotificationFixture } from "./notification.factory";
import {
  loginAsSuperAdmin,
  loginAsUser,
  createAuthenticatedContext,
} from "@/shared/tests/e2e-helpers";
import { routes } from "@/shared/config/routes";

test.describe.serial("Notifications E2E", () => {
  let superContext: APIRequestContext;
  let userContext: APIRequestContext;
  let adminContext: APIRequestContext;
  let securityTitle: string;
  let productTitle: string;

  test.beforeAll(async ({ playwright }) => {
    test.setTimeout(120000);

    superContext = await createAuthenticatedContext(playwright, "super_admin");
    userContext = await createAuthenticatedContext(playwright, "user");
    adminContext = await createAuthenticatedContext(playwright, "admin");
  });

  test.afterAll(async () => {
    await superContext?.dispose();
    await userContext?.dispose();
    await adminContext?.dispose();
  });

  test.describe("API: Channel Settings", () => {
    test("should get default channel settings with all enabled", async () => {
      const res = await superContext.get("/api/notifications/settings");
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.email).toBe(true);
      expect(body.data.push).toBe(true);
      expect(body.data.whatsapp).toBe(true);
    });

    test("should update channel preferences", async () => {
      const res = await superContext.put("/api/notifications/settings", {
        data: { email: false, push: false },
        headers: { "Content-Type": "application/json" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.email).toBe(false);
      expect(body.data.push).toBe(false);

      await superContext.put("/api/notifications/settings", {
        data: { email: true, push: true },
        headers: { "Content-Type": "application/json" },
      });
    });
  });

  test.describe("API: Module Subscriptions", () => {
    test("should get default subscription settings with all types enabled", async () => {
      const res = await superContext.get("/api/notifications/settings");
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.system).toBe(true);
      expect(body.data.security).toBe(true);
      expect(body.data.marketing).toBe(true);
      expect(body.data.product).toBe(true);
      expect(body.data.general).toBe(true);
    });

    test("should update optional module subscriptions", async () => {
      const res = await superContext.put("/api/notifications/settings", {
        data: { subscriptions: { marketing: false, product: false } },
        headers: { "Content-Type": "application/json" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.marketing).toBe(false);
      expect(body.data.product).toBe(false);

      await superContext.put("/api/notifications/settings", {
        data: { subscriptions: { marketing: true, product: true } },
        headers: { "Content-Type": "application/json" },
      });
    });

    test("should ignore mandatory types (system, security) when unsubscribing", async () => {
      const res = await superContext.put("/api/notifications/settings", {
        data: { subscriptions: { system: false, security: false } },
        headers: { "Content-Type": "application/json" },
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.system).toBe(true);
      expect(body.data.security).toBe(true);
    });
  });

  test.describe("API: Notification CRUD", () => {
    test.beforeEach(async () => {
      await superContext.delete("/api/notifications");
    });

    test("should create notifications with type and priority", async () => {
      const n1 = createNotificationFixture("E2E Security", {
        type: "security", priority: "critical",
      });
      const n2 = createNotificationFixture("E2E Product", {
        type: "product", priority: "high",
      });
      securityTitle = n1.title;
      productTitle = n2.title;

      const r1 = await superContext.post("/api/notifications", {
        data: { title: n1.title, message: n1.message, type: n1.type, priority: n1.priority },
        headers: { "Content-Type": "application/json" },
      });
      const r2 = await superContext.post("/api/notifications", {
        data: { title: n2.title, message: n2.message, type: n2.type, priority: n2.priority },
        headers: { "Content-Type": "application/json" },
      });

      expect([200, 201]).toContain(r1.status());
      expect([200, 201]).toContain(r2.status());

      const body1 = await r1.json();
      expect(body1.success).toBe(true);
      expect(body1.data.type).toBe("security");
      expect(body1.data.priority).toBe("critical");
      expect(body1.data.readAt).toBeNull();
    });

    test("should list notifications with metadata", async () => {
      const n = createNotificationFixture("List Test", { type: "general" });
      await superContext.post("/api/notifications", {
        data: { title: n.title, message: n.message, type: n.type },
        headers: { "Content-Type": "application/json" },
      });

      const res = await superContext.get("/api/notifications");
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const notif = body.data[0];
      expect(notif.type).toBeDefined();
      expect(notif.priority).toBeDefined();
      expect(["system", "security", "marketing", "product", "general"]).toContain(notif.type);
      expect(["low", "medium", "high", "critical"]).toContain(notif.priority);
    });

    test("should return unread count", async () => {
      const res = await superContext.get("/api/notifications/unread-count");
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.data.unreadCount).toBe("number");
    });

    test("should delete all notifications", async () => {
      const del = await superContext.delete("/api/notifications");
      expect(del.status()).toBe(200);

      const list = await superContext.get("/api/notifications");
      const body = await list.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBe(0);
    });
  });

  test.describe("Flow: Module Subscription Filtering", () => {
    test.beforeEach(async () => {
      await userContext.delete("/api/notifications");
      await userContext.put("/api/notifications/settings", {
        data: { email: true, push: true, whatsapp: true, subscriptions: { marketing: true, product: true, general: true } },
        headers: { "Content-Type": "application/json" },
      });
    });

    test("should skip notification when user unsubscribed from that module", async () => {
      await userContext.put("/api/notifications/settings", {
        data: { subscriptions: { marketing: false } },
        headers: { "Content-Type": "application/json" },
      });

      const n = createNotificationFixture("Marketing Unsubscribed", { type: "marketing" });
      const r = await userContext.post("/api/notifications", {
        data: { title: n.title, message: n.message, type: n.type, priority: n.priority },
        headers: { "Content-Type": "application/json" },
      });
      expect(r.status()).toBe(200);
      const body = await r.json();
      expect(body.success).toBe(true);
      expect(body.data.skipped).toBe(true);

      const listRes = await userContext.get("/api/notifications");
      const listBody = await listRes.json();
      const found = listBody.data.find((notif: { title: string }) => notif.title === n.title);
      expect(found).toBeUndefined();
    });

    test("should still deliver notification for mandatory type despite disabled optional", async () => {
      await userContext.put("/api/notifications/settings", {
        data: { subscriptions: { marketing: false } },
        headers: { "Content-Type": "application/json" },
      });

      const n = createNotificationFixture("Security Bypass", { type: "security", priority: "critical" });
      const r = await userContext.post("/api/notifications", {
        data: { title: n.title, message: n.message, type: n.type, priority: n.priority },
        headers: { "Content-Type": "application/json" },
      });
      expect(r.status()).toBe(201);
      const body = await r.json();
      expect(body.success).toBe(true);
      expect(body.data.type).toBe("security");

      const listRes = await userContext.get("/api/notifications");
      const listBody = await listRes.json();
      const found = listBody.data.find((notif: { title: string }) => notif.title === n.title);
      expect(found).toBeDefined();
    });

    test("should deliver notification when user re-subscribes to a module", async () => {
      const n = createNotificationFixture("Resubscribed", { type: "marketing" });
      const r = await userContext.post("/api/notifications", {
        data: { title: n.title, message: n.message, type: n.type, priority: n.priority },
        headers: { "Content-Type": "application/json" },
      });

      await expect(r.status()).toBe(201);
      const body = await r.json();
      expect(body.success).toBe(true);
      expect(body.data.type).toBe("marketing");
    });
  });

  test.describe("UI: Notification Sheet", () => {
    test.beforeAll(async () => {
      await superContext.delete("/api/notifications");

      const n1 = createNotificationFixture("UI Security", {
        type: "security", priority: "critical",
      });
      const n2 = createNotificationFixture("UI Product", {
        type: "product", priority: "high",
      });
      securityTitle = n1.title;
      productTitle = n2.title;

      await superContext.post("/api/notifications", {
        data: { title: n1.title, message: n1.message, type: n1.type, priority: n1.priority },
        headers: { "Content-Type": "application/json" },
      });
      await superContext.post("/api/notifications", {
        data: { title: n2.title, message: n2.message, type: n2.type, priority: n2.priority },
        headers: { "Content-Type": "application/json" },
      });
    });

    test.beforeEach(async ({ page }) => {
      await loginAsSuperAdmin(page);
      await page.goto(routes.dashboard.root);
      await page.waitForTimeout(1500);
    });

    test("should open and display notifications", async ({ page }) => {
      await page.getByRole("button", { name: "Notifications" }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();
      await expect(sheet.getByRole("heading", { name: "Notifications" })).toBeVisible();

      await expect(sheet.getByRole("button", { name: securityTitle })).toBeVisible();
      await expect(sheet.getByRole("button", { name: productTitle })).toBeVisible();
    });

    test("should show unread badge in header", async ({ page }) => {
      const badge = page.getByRole("button", { name: "Notifications" }).locator(".rounded-full");
      await expect(badge).toBeVisible();
      await expect(badge).not.toBeEmpty();
    });

    test("should mark a single notification as read", async ({ page }) => {
      await page.getByRole("button", { name: "Notifications" }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();

      const unreadBtn = sheet.getByRole("button", { name: new RegExp(securityTitle), disabled: false });
      await expect(unreadBtn).toBeVisible();
      await unreadBtn.click();

      await expect(
        sheet.getByRole("button", { name: new RegExp(securityTitle), disabled: true })
      ).toBeVisible({ timeout: 5000 });

      const listRes = await superContext.get("/api/notifications");
      const listBody = await listRes.json();
      const marked = listBody.data?.find((n: { title: string }) => n.title === securityTitle);
      expect(marked).toBeDefined();
      expect(marked.read).toBe(true);
      expect(marked.readAt).not.toBeNull();
    });

    test("should mark all notifications as read", async ({ page }) => {
      await page.getByRole("button", { name: "Notifications" }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();

      const markAllBtn = sheet.getByRole("button", { name: /mark all read/i });
      await expect(markAllBtn).toBeVisible();
      await markAllBtn.click();

      await expect(sheet.getByRole("button", { name: /mark all read/i })).not.toBeVisible({ timeout: 5000 });
    });

    test("should show empty state when no notifications", async ({ page }) => {
      await userContext.delete("/api/notifications");

      await loginAsUser(page);
      await page.goto(routes.dashboard.root);
      await page.waitForTimeout(1500);

      await page.getByRole("button", { name: "Notifications" }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();
      await expect(sheet.getByText("No notifications yet")).toBeVisible();
    });
  });

  test.describe("UI: Settings Page", () => {
    test("should toggle email channel and persist", async ({ page }) => {
      await loginAsUser(page);

      await page.goto(routes.dashboard.settings.notifications, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1000);

      const emailSwitch = page.locator("#notif-email");
      await expect(emailSwitch).toBeVisible();

      if (await emailSwitch.isChecked()) {
        await emailSwitch.click();
      }
      await expect(emailSwitch).not.toBeChecked();

      await page.getByRole("button", { name: /save preferences/i }).click();
      await page.waitForTimeout(1000);

      await emailSwitch.click();
      await expect(emailSwitch).toBeChecked();
      await page.getByRole("button", { name: /save preferences/i }).click();
      await page.waitForTimeout(500);
    });

    test("should toggle product subscription and persist", async ({ page }) => {
      await loginAsUser(page);

      await page.goto(routes.dashboard.settings.notifications, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1000);

      const productSwitch = page.locator("#notif-sub-product");
      await expect(productSwitch).toBeVisible();

      if (await productSwitch.isChecked()) {
        await productSwitch.click();
      }
      await expect(productSwitch).not.toBeChecked();

      await page.getByRole("button", { name: /save preferences/i }).click();
      await page.waitForTimeout(1000);

      await productSwitch.click();
      await expect(productSwitch).toBeChecked();
      await page.getByRole("button", { name: /save preferences/i }).click();
      await page.waitForTimeout(500);
    });

    test("should show mandatory types (system, security) as disabled", async ({ page }) => {
      await loginAsUser(page);

      await page.goto(routes.dashboard.settings.notifications, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1000);

      const systemSwitch = page.locator("#notif-sub-system");
      const securitySwitch = page.locator("#notif-sub-security");

      await expect(systemSwitch).toBeDisabled();
      await expect(systemSwitch).toBeChecked();
      await expect(securitySwitch).toBeDisabled();
      await expect(securitySwitch).toBeChecked();
    });

  });

  test.describe("RBAC: Role Isolation", () => {
    test("user role should create own notification and see it in sheet", async ({ page }) => {
      await userContext.delete("/api/notifications");

      const n = createNotificationFixture("User Notif", { type: "general", priority: "low" });
      const r = await userContext.post("/api/notifications", {
        data: { title: n.title, message: n.message, type: n.type, priority: n.priority },
        headers: { "Content-Type": "application/json" },
      });
      expect([200, 201]).toContain(r.status());

      await loginAsUser(page);

      await page.goto(routes.dashboard.root);
      await page.waitForTimeout(1500);

      await page.getByRole("button", { name: "Notifications" }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();
      await expect(sheet.getByRole("button", { name: n.title })).toBeVisible();
    });

    test("should isolate notifications between users", async ({ page }) => {
      await superContext.delete("/api/notifications");
      await userContext.delete("/api/notifications");

      const userANotif = createNotificationFixture("UserA Secret", { type: "general" });
      await superContext.post("/api/notifications", {
        data: { title: userANotif.title, message: userANotif.message, type: userANotif.type, priority: userANotif.priority },
        headers: { "Content-Type": "application/json" },
      });

      await loginAsUser(page);
      await page.goto(routes.dashboard.root);
      await page.waitForTimeout(1500);

      await page.getByRole("button", { name: "Notifications" }).click();
      const sheet = page.getByRole("dialog");
      await expect(sheet).toBeVisible();

      await expect(sheet.getByRole("button", { name: userANotif.title })).not.toBeVisible();
    });
  });
});
