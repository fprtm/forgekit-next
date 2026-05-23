/**
 * @file products.e2e.ts
 * @description End-to-End browser UI tests for the Products module.
 * This file verifies the visual presentation layer, routing, creation, editing, deletion, and validation flows
 * inside a live browser environment driven by Playwright.
 *
 * @module Products/Presentation/Tests/E2E
 */

import { waitForTyping } from "@/lib/utils";
import { test, expect } from "@playwright/test";
import { createProductFixture } from "./product.factory";

test.describe.serial("Products Module E2E", () => {
  // 💡 Shared variables to dynamically store product names across sequential tests
  let uniqueProductName: string;
  let editedProductName: string;

  /**
   * @test should navigate to products page and display the list
   * Verify basic layout, headers, and navigation options.
   */
  test("should navigate to products page and display the list", async ({
    page,
  }) => {
    // Navigate to products page
    await page.goto("/products");

    // Check if the page title or main heading exists
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    // Check if the Create Product button exists
    await expect(
      page.getByRole("link", { name: "Create Product" }),
    ).toBeVisible();
  });

  /**
   * @test should successfully create a new product and see it in the list
   * Verify full data flow from input forms, Next.js Server Actions, Drizzle, PostgreSQL to UI Table.
   */
  test("should successfully create a new product and see it in the list", async ({
    page,
  }) => {
    // Generate a unique product template from our Factory
    const productData = createProductFixture("E2E Product");
    uniqueProductName = productData.name;

    await page.goto("/products/create");
    await page
      .getByLabel("Product Name")
      .pressSequentially(uniqueProductName, { delay: waitForTyping() });
    await page
      .getByLabel("Price")
      .pressSequentially(productData.price, { delay: waitForTyping() });
    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(page).toHaveURL(/.*\/products$/);
    await page.waitForTimeout(1000);
    await expect(page.getByText(uniqueProductName)).toBeVisible();
  });

  /**
   * @test should successfully edit a product
   * Verify updates to name and price, and that changes are visually reflected.
   */
  test("should successfully edit a product", async ({ page }) => {
    await page.goto("/products");

    // Wait for full hydration
    await page.waitForTimeout(1000);

    // 1. Find the specific row for the product we just created
    const productRow = page
      .locator("tr")
      .filter({ hasText: uniqueProductName });

    // 2. Find the edit button inside that specific row using its test-id prefix
    const editButton = productRow.locator("[data-testid^='edit-button']");
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Verify redirection to edit page
    await expect(page).toHaveURL(/.*\/products\/.*\/edit/);

    // Generate dynamic edit data from our Factory
    const editData = createProductFixture("Edited E2E Product");
    editedProductName = editData.name;

    // Clear old input first, then type the new product name naturally
    await page.getByLabel("Product Name").clear();
    await page
      .getByLabel("Product Name")
      .pressSequentially(editedProductName, { delay: waitForTyping() });

    // Clear old price first, then type the new price naturally
    await page.getByLabel("Price").clear();
    await page
      .getByLabel("Price")
      .pressSequentially("20000", { delay: waitForTyping() });

    await page.getByRole("button", { name: "Update Product" }).click();

    // Verify returning back to listing page with updated values
    await expect(page).toHaveURL(/.*\/products$/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(editedProductName)).toBeVisible();
  });

  /**
   * @test should successfully delete a product
   * Verify database deletion triggers, standard browser confirmation, and Success Toast reaction.
   */
  test("should successfully delete a product", async ({ page }) => {
    await page.goto("/products");

    // Wait for full hydration
    await page.waitForTimeout(1000);

    // 1. Find the specific row for the product we edited
    const productRow = page
      .locator("tr")
      .filter({ hasText: editedProductName });

    // 2. Find the delete button inside that specific row using its test-id prefix
    const deleteButton = productRow.locator("[data-testid^='delete-button']");
    await expect(deleteButton).toBeVisible();

    // Accept standard browser confirmation dialog
    page.on("dialog", (dialog) => dialog.accept());

    await deleteButton.click();

    // Verify success notification popup
    await expect(page.getByText("Product deleted successfully")).toBeVisible();
  });

  /**
   * @test should show validation errors on empty form submit
   * Verify server-side / client-side validations inside inputs are visually displayed as error text.
   */
  test("should show validation errors on empty form submit", async ({
    page,
  }) => {
    await page.goto("/products/create");
    await page.getByRole("button", { name: "Create Product" }).click();

    // The zod validation should show errors
    await expect(
      page.getByText("String must contain at least 2 character(s)"),
    ).toBeVisible();
    await expect(page.getByText("Price must be greater than 0")).toBeVisible();
  });
});
