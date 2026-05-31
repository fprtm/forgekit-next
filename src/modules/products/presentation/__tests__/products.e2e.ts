import { waitForTyping } from "@/shared/lib/utils";
import { test, expect, type Browser } from "@playwright/test";
import { createProductFixture } from "./product.factory";

const SEED_EMAIL = "e2e-superadmin@forgekit.test";
const SEED_PASSWORD = "00superadmin@forgekit.test";

async function loginAndGetCookies(browser: Browser): Promise<{ name: string; value: string; domain: string; path: string }[]> {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByLabel("Email Address").fill(SEED_EMAIL);
  await page.getByLabel("Password").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Sign In with Email" }).click();
  await page.waitForURL("/d");

  const cookies = await context.cookies();
  await context.close();

  return cookies.map(c => ({ name: c.name, value: c.value, domain: c.domain, path: c.path }));
}

test.describe.serial("Products Module E2E", () => {
  let authCookies: { name: string; value: string; domain: string; path: string }[];

  test.beforeAll(async ({ browser }) => {
    authCookies = await loginAndGetCookies(browser);
  });

  let uniqueProductName: string;
  let editedProductName: string;

  test("should navigate to products page and display the list", async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto("/d/products");

    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Create Product" }),
    ).toBeVisible();
  });

  test("should successfully create a new product and see it in the list", async ({ page, context }) => {
    const productData = createProductFixture("E2E Product");
    uniqueProductName = productData.name;

    await context.addCookies(authCookies);
    await page.goto("/d/products/create");
    await page
      .getByLabel("Product Name")
      .pressSequentially(uniqueProductName, { delay: waitForTyping() });
    await page
      .getByLabel("Price")
      .pressSequentially(productData.price, { delay: waitForTyping() });
    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(page).toHaveURL(/.*\/d\/products$/);
    await page.waitForTimeout(1000);
    await expect(page.getByText(uniqueProductName)).toBeVisible();
  });

  test("should successfully edit a product", async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto("/d/products");

    await page.waitForTimeout(1000);

    const productRow = page
      .locator("tr")
      .filter({ hasText: uniqueProductName });

    const editButton = productRow.locator("[data-testid^='edit-button']");
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page).toHaveURL(/.*\/d\/products\/.*\/edit/, { timeout: 15000 });

    const editData = createProductFixture("Edited E2E Product");
    editedProductName = editData.name;

    await page.getByLabel("Product Name").clear();
    await page
      .getByLabel("Product Name")
      .pressSequentially(editedProductName, { delay: waitForTyping() });

    await page.getByLabel("Price").clear();
    await page
      .getByLabel("Price")
      .pressSequentially("20000", { delay: waitForTyping() });

    await page.getByRole("button", { name: "Update Product" }).click();

    await expect(page).toHaveURL(/.*\/d\/products$/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(editedProductName)).toBeVisible();
  });

  test("should successfully delete a product", async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto("/d/products");

    await page.waitForTimeout(1000);

    const productRow = page
      .locator("tr")
      .filter({ hasText: editedProductName });

    const deleteButton = productRow.locator("[data-testid^='delete-button']");
    await expect(deleteButton).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());

    await deleteButton.click();

    await expect(page.getByText("Product deleted successfully")).toBeVisible();
  });

  test("should show validation errors on empty form submit", async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto("/d/products/create");
    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(
      page.getByText("String must contain at least 2 character(s)"),
    ).toBeVisible();
    await expect(page.getByText("Price must be greater than 0")).toBeVisible();
  });
});
