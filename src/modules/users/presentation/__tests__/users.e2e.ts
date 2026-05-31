import { test, expect, type Browser, type BrowserContext } from '@playwright/test';
import { createUserFixture } from './user.factory';

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

test.describe.serial('Users Module E2E - Positive Path', () => {
  let authCookies: { name: string; value: string; domain: string; path: string }[];

  test.beforeAll(async ({ browser }) => {
    authCookies = await loginAndGetCookies(browser);
  });

  let uniqueUserName: string;
  let editedUserName: string;

  test('should navigate to users page and display the list', async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto('/d/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display correct table headers', async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto('/d/users');

    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
  });

  test('should navigate to create user page', async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto('/d/users');
    await page.getByRole('main').getByRole('link', { name: 'Create User' }).click();

    await expect(page).toHaveURL(/.*\/d\/users\/create/, { timeout: 15000 });

    await expect(page.getByRole('heading', { name: 'Create User' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Role')).toBeVisible();
  });

  test('should successfully create a new user and see it in the list', async ({ page, context }) => {
    const userData = createUserFixture("E2E User");
    uniqueUserName = userData.name;

    await context.addCookies(authCookies);
    await page.goto('/d/users/create');
    await page.getByLabel('Full Name').fill(uniqueUserName);
    await page.getByLabel('Email Address').fill(userData.email);

    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'User' }).click();

    await page.getByRole('button', { name: 'Create User' }).click();

    await expect(page).toHaveURL(/.*\/d\/users$/, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.getByText(uniqueUserName)).toBeVisible();
  });

  test('should successfully edit a user role', async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto('/d/users');

    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: uniqueUserName });

    const editButton = userRow.locator("[data-testid^='edit-button']");
    await expect(editButton).toBeVisible();
    await editButton.click();

    await expect(page).toHaveURL(/.*\/d\/users\/.*\/edit/, { timeout: 15000 });

    const editData = createUserFixture("Edited E2E User");
    editedUserName = editData.name;

    await page.getByLabel('Full Name').clear();
    await page.getByLabel('Full Name').fill(editedUserName);

    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Admin' }).click();

    await page.getByRole('button', { name: 'Update Profile' }).click();

    await expect(page).toHaveURL(/.*\/d\/users$/, { timeout: 15000 });
    await page.waitForTimeout(1000);

    await expect(page.getByText(editedUserName)).toBeVisible();
  });

  test('should successfully delete a user', async ({ page, context }) => {
    await context.addCookies(authCookies);
    await page.goto('/d/users');

    await page.waitForTimeout(1000);

    const userRow = page.locator("tr").filter({ hasText: editedUserName });

    const deleteButton = userRow.locator("[data-testid^='delete-button']");
    await expect(deleteButton).toBeVisible();

    page.on('dialog', dialog => dialog.accept());

    await deleteButton.click();

    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });
});
