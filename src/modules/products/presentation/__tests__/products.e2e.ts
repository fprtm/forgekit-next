import { test, expect } from "@playwright/test";
import { createProductFixture } from "./product.factory";
import { loginAsSuperAdmin } from "@/shared/tests/e2e-helpers";

test.describe.serial("Products Module E2E", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  let uniqueProductName: string;
  let editedProductName: string;

  test("should navigate to products page and display the list", async ({ page }) => {
    await page.goto("/d/products");

    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Create Product" }),
    ).toBeVisible();
  });

  test("should successfully create a new product and see it in the list", async ({ page }) => {
    const productData = createProductFixture("E2E Product");
    uniqueProductName = productData.name;

    await page.goto("/d/products/create");
    await page.getByLabel("Product Name").fill(uniqueProductName);
    await page.getByLabel("Price").fill(productData.price);
    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(page).toHaveURL(/.*\/d\/products$/);
    await page.waitForTimeout(1000);
    await expect(page.getByText(uniqueProductName)).toBeVisible();
  });

  test("should successfully edit a product", async ({ page }) => {
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
    await page.getByLabel("Product Name").fill(editedProductName);

    await page.getByLabel("Price").clear();
    await page.getByLabel("Price").fill("20000");

    await page.getByRole("button", { name: "Update Product" }).click();

    await expect(page).toHaveURL(/.*\/d\/products$/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(editedProductName)).toBeVisible();
  });

  test("should successfully delete a product", async ({ page }) => {
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

  test("should show validation errors on empty form submit", async ({ page }) => {
    await page.goto("/d/products/create");
    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(
      page.getByText("String must contain at least 2 character(s)"),
    ).toBeVisible();
    await expect(page.getByText("Price must be greater than 0")).toBeVisible();
  });
});
