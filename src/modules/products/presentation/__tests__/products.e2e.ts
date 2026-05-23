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

test.describe.serial("Products Module E2E", () => {
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
    const uniqueProductName = `Test Product ${Date.now()}`;
    await page.goto("/products/create");
    await page
      .getByLabel("Product Name")
      .pressSequentially(uniqueProductName, { delay: waitForTyping() });
    await page
      .getByLabel("Price")
      .pressSequentially("15000", { delay: waitForTyping() });
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

    // Find the first Edit button
    const firstEditButton = page.getByRole("link", { name: "Edit" }).first();

    // Ensure at least one Edit button exists
    await expect(firstEditButton).toBeVisible();
    await firstEditButton.click();

    // Verify redirection to edit page
    await expect(page).toHaveURL(/.*\/products\/.*\/edit/);

    const editName = `Edited Product ${Date.now()}`;
    await page.getByLabel("Product Name").clear();
    await page
      .getByLabel("Product Name")
      .pressSequentially(editName, { delay: waitForTyping() });
    await page.getByLabel("Price").clear();
    await page
      .getByLabel("Price")
      .pressSequentially("20000", { delay: waitForTyping() });

    await page.getByRole("button", { name: "Update Product" }).click();

    // Verify back to list with updated values
    await expect(page).toHaveURL(/.*\/products$/);
    await page.waitForTimeout(1000);

    await expect(page.getByText(editName)).toBeVisible();
  });

  /**
   * @test should successfully delete a product
   * Verify database deletion triggers, standard browser confirmation, and Success Toast reaction.
   */
  test("should successfully delete a product", async ({ page }) => {
    await page.goto("/products");

    // Wait for full hydration
    await page.waitForTimeout(1000);

    const firstDeleteButton = page
      .getByRole("button", { name: "Delete" })
      .first();
    await expect(firstDeleteButton).toBeVisible();

    // Accept standard browser confirmation dialog
    page.on("dialog", (dialog) => dialog.accept());

    await firstDeleteButton.click();

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
