/**
 * @file users.e2e.ts
 * @description End-to-End browser UI tests for the Users module.
 * This file verifies user management features including listings, custom role and name modifications,
 * and user deletion workflows inside a live browser environment driven by Playwright.
 * 
 * @module Users/Presentation/Tests/E2E
 */

import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe.serial('Users Module E2E - Positive Path', () => {
  let testUserId: string;

  /**
   * Database Setup Seeder.
   * Inject a clean test user into the database before starting the E2E suite to guarantee test stability.
   */
  test.beforeAll(async () => {
    const pool = new Pool({ connectionString: 'postgresql://leviosa:leviosa@localhost:5432/forge-kit' });
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    const res = await pool.query(
      "INSERT INTO users (id, name, email, role) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id",
      ['Test Playwright User', uniqueEmail, 'user']
    );
    testUserId = res.rows[0].id;
    await pool.end();
  });

  /**
   * @test should navigate to users page and display the list
   * Verify listing page mounts and displays user tables.
   */
  test('should navigate to users page and display the list', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  /**
   * @test should display correct table headers
   * Verify that essential metadata headers are fully rendered in the viewport.
   */
  test('should display correct table headers', async ({ page }) => {
    await page.goto('/users');
    
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
  });

  /**
   * @test should successfully edit a user role
   * Verify full administration profile updates (role and name editing) via Server Actions.
   */
  test('should successfully edit a user role', async ({ page }) => {
    await page.goto('/users');
    
    // Wait for full hydration
    await page.waitForTimeout(1000);
    
    // Find the first edit option
    const firstEditButton = page.getByRole('link', { name: 'Edit' }).first();
    await expect(firstEditButton).toBeVisible();
    await firstEditButton.click();

    // Verify redirection to profile editing page
    await expect(page).toHaveURL(/.*\/users\/.*\/edit/);

    // Edit full name field
    const editName = `Edited User ${Date.now()}`;
    await page.getByLabel('Full Name').fill(editName);
    
    // Trigger Select UI dropdown and change user role to Admin
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Admin' }).click();

    await page.getByRole('button', { name: 'Update User' }).click();

    // Verify returning back to listing page with updated profile info
    await expect(page).toHaveURL(/.*\/users$/);
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(editName)).toBeVisible();
  });

  /**
   * @test should successfully delete a user
   * Verify standard deletion triggers, dialog confirmation, and Success Toast reaction.
   */
  test('should successfully delete a user', async ({ page }) => {
    await page.goto('/users');
    
    // Wait for full hydration
    await page.waitForTimeout(1000);

    const firstDeleteButton = page.getByRole('button', { name: 'Delete' }).first();
    await expect(firstDeleteButton).toBeVisible();

    // Accept standard browser confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    await firstDeleteButton.click();

    // Verify success notification popup
    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });
});
export { testUserId };
