import { test, expect } from '@playwright/test';
import { createUserFixture } from './user.factory';
import { loginAsSuperAdmin, loginAsUser } from '@/shared/tests/e2e-helpers';
import { routes } from '@/shared/config/routes';

test.describe.serial('Users Module E2E - Positive Path', () => {
  test.setTimeout(60000);
  let uniqueUserName: string;
  let uniqueUserEmail: string;
  let editedUserName: string;

  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('should navigate to accounts page and display the list', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);
    await expect(page.getByRole('heading', { name: 'Accounts' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display correct table headers', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);

    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
  });

  test('should navigate to create user page', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);
    await page.getByRole('main').getByRole('link', { name: 'Create User' }).click();

    await expect(page).toHaveURL(/.*\/d\/users\/create/, { timeout: 15000 });

    await expect(page.getByRole('heading', { name: 'Create User' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Role')).toBeVisible();
  });

  test('should successfully create a new user and see it in the list', async ({ page }) => {
    const userData = createUserFixture("E2E User");
    uniqueUserName = userData.name;
    uniqueUserEmail = userData.email;

    await page.goto(routes.dashboard.users.create);
    await page.getByLabel('Full Name').fill(uniqueUserName);
    await page.getByLabel('Email Address').fill(uniqueUserEmail);

    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Admin' }).click();

    await page.getByRole('button', { name: 'Create User' }).click();

    await expect(page).toHaveURL(/.*\/d\/users\/admins$/, { timeout: 15000 });

    await page.getByPlaceholder('Search...').fill(uniqueUserEmail);
    await page.waitForTimeout(1000);

    await expect(page.getByText(uniqueUserName)).toBeVisible();
  });

  test('should successfully edit a user account', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('Search...').fill(uniqueUserEmail);
    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: uniqueUserName });

    const editButton = userRow.locator("[data-testid^='edit-button']");
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page).toHaveURL(/.*\/d\/users\/.*\/edit$/, { timeout: 15000 });

    const editData = createUserFixture("Edited E2E User");
    editedUserName = editData.name;

    await page.getByLabel('Full Name').clear();
    await page.getByLabel('Full Name').fill(editedUserName);

    await page.getByRole('combobox', { name: 'Role' }).click();
    await page.getByRole('option', { name: 'User' }).click();

    await page.getByRole('button', { name: 'Update User' }).click();

    await expect(page).toHaveURL(/.*\/d\/users\/users$/, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('Search...').fill(uniqueUserEmail);
    await page.waitForTimeout(1000);

    await expect(page.getByText(editedUserName)).toBeVisible();
  });

  test('should successfully edit a user profile', async ({ page }) => {
    await page.goto(routes.dashboard.users.users);
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('Search...').fill(uniqueUserEmail);
    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: editedUserName });
    const editButton = userRow.locator("[data-testid^='edit-button']");
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page).toHaveURL(/.*\/d\/users\/.*\/edit\?profile=true/, { timeout: 15000 });

    await page.getByLabel('Phone Number').clear();
    await page.getByLabel('Phone Number').fill('+62 812-3456-789');

    await page.getByRole('combobox', { name: 'Gender' }).click();
    await page.getByRole('option', { name: 'Female' }).click();

    await page.getByLabel('Date of Birth').fill('1990-05-15');

    await page.getByLabel('Preferred Pronouns').clear();
    await page.getByLabel('Preferred Pronouns').fill('she/her');

    await page.getByLabel('Biography').clear();
    await page.getByLabel('Biography').fill('A test user profile.');

    await page.getByLabel('Address', { exact: true }).clear();
    await page.getByLabel('Address', { exact: true }).fill('123 Test Ave');

    await page.getByLabel('City').clear();
    await page.getByLabel('City').fill('Jakarta');

    await page.getByRole('button', { name: 'Update User' }).click();

    await expect(page).toHaveURL(/.*\/d\/users\/users$/, { timeout: 15000 });
  });

  test('should successfully reset a user password', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('Search...').fill(uniqueUserEmail);
    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: editedUserName });

    const resetButton = userRow.locator("[data-testid^='reset-password-button-']");
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    await expect(page.getByText('Password Reset Successful')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully delete a user', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);
    await page.waitForTimeout(1000);

    await page.getByPlaceholder('Search...').fill(uniqueUserEmail);
    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: editedUserName });

    const deleteButton = userRow.locator("[data-testid^='delete-button-']");
    await expect(deleteButton).toBeVisible();

    page.on('dialog', dialog => dialog.accept());

    await deleteButton.click();

    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });

  test('should successfully view isolated admin-only account list', async ({ page }) => {
    await page.goto(routes.dashboard.users.admins);
    await expect(page.getByRole('heading', { name: 'Admins' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();

    await expect(page.locator('tr').filter({ hasText: 'Admin' }).first()).toBeVisible();
  });

  test('should successfully view isolated user-only account list', async ({ page }) => {
    await page.goto(routes.dashboard.users.users);
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Users Module E2E - Negative / RBAC Path', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should deny access to accounts and admins pages for regular user', async ({ page }) => {
    await page.goto(routes.dashboard.users.accounts);
    await expect(page).toHaveURL(/.*\/d$/, { timeout: 10000 });

    await page.goto(routes.dashboard.users.admins);
    await expect(page).toHaveURL(/.*\/d$/, { timeout: 10000 });

    await page.goto(routes.dashboard.users.users);
    await expect(page).toHaveURL(/.*\/d$/, { timeout: 10000 });
  });
});
