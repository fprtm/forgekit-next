/**
 * @file users.e2e.ts
 * @description End-to-End browser UI tests for the Users module.
 * This file verifies user management features including creation, listings, custom role and name modifications,
 * and user deletion workflows inside a live browser environment driven by Playwright.
 * 
 * @module Users/Presentation/Tests/E2E
 */

import { test, expect } from '@playwright/test';
import { createUserFixture } from './user.factory';

test.describe.serial('Users Module E2E - Positive Path', () => {
  // 💡 Shared variables to dynamically store user profiles across sequential tests
  let uniqueUserName: string;
  let editedUserName: string;

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
   * @test should navigate to create user page
   * Verify redirection and existence of crucial form fields.
   */
  test('should navigate to create user page', async ({ page }) => {
    await page.goto('/users');
    await page.getByRole('link', { name: 'Create User' }).click();

    // Verify URL with a relaxed timeout to accommodate development compilation
    await expect(page).toHaveURL(/.*\/users\/create/, { timeout: 15000 });

    // Verify form exists
    await expect(page.getByRole('heading', { name: 'Create User' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Role')).toBeVisible();
  });

  /**
   * @test should successfully create a new user and see it in the list
   * Verify full data flow from input forms, Next.js Server Actions, Drizzle, PostgreSQL to UI Table.
   */
  test('should successfully create a new user and see it in the list', async ({ page }) => {
    // Generate unique user profile from our Factory
    const userData = createUserFixture("E2E User");
    uniqueUserName = userData.name;
    
    await page.goto('/users/create');
    await page.getByLabel('Full Name').fill(uniqueUserName);
    await page.getByLabel('Email Address').fill(userData.email);
    
    // Select role UI
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'User' }).click();
    
    await page.getByRole('button', { name: 'Create User' }).click();

    await expect(page).toHaveURL(/.*\/users$/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.getByText(uniqueUserName)).toBeVisible();
  });

  /**
   * @test should successfully edit a user role
   * Verify full administration profile updates (role and name editing) via Server Actions.
   */
  test('should successfully edit a user role', async ({ page }) => {
    await page.goto('/users');
    
    // Wait for full hydration
    await page.waitForTimeout(1000);
    
    // 1. Find the specific row for the user we just created
    const userRow = page.locator("tr").filter({ hasText: uniqueUserName });

    // 2. Find the edit button inside that specific row using its test-id prefix
    const editButton = userRow.locator("[data-testid^='edit-button']");
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Verify redirection to profile editing page with relaxed timeout
    await expect(page).toHaveURL(/.*\/users\/.*\/edit/, { timeout: 15000 });

    // Edit full name field with unique name from Factory
    const editData = createUserFixture("Edited E2E User");
    editedUserName = editData.name;

    await page.getByLabel('Full Name').clear();
    await page.getByLabel('Full Name').fill(editedUserName);
    
    // Trigger Select UI dropdown and change user role to Admin
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Admin' }).click();

    await page.getByRole('button', { name: 'Update User' }).click();

    // Verify returning back to listing page with updated profile info
    await expect(page).toHaveURL(/.*\/users$/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    
    await expect(page.getByText(editedUserName)).toBeVisible();
  });

  /**
   * @test should successfully delete a user
   * Verify standard deletion triggers, dialog confirmation, and Success Toast reaction.
   */
  test('should successfully delete a user', async ({ page }) => {
    await page.goto('/users');
    
    // Wait for full hydration
    await page.waitForTimeout(1000);

    // 1. Find the specific row for the user we edited
    const userRow = page.locator("tr").filter({ hasText: editedUserName });

    // 2. Find the delete button inside that specific row using its test-id prefix
    const deleteButton = userRow.locator("[data-testid^='delete-button']");
    await expect(deleteButton).toBeVisible();

    // Accept standard browser confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    await deleteButton.click();

    // Verify success notification popup
    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });
});
