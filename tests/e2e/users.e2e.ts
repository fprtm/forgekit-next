import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe.serial('Users Module E2E - Positive Path', () => {
  let testUserId: string;

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
  test('should navigate to users page and display the list', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should display correct table headers', async ({ page }) => {
    await page.goto('/users');
    
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
  });

  test('should successfully edit a user role', async ({ page }) => {
    await page.goto('/users');
    
    // Tunggu hidrasi selesai sepenuhnya
    await page.waitForTimeout(1000);
    
    // Cari tombol Edit pertama
    const firstEditButton = page.getByRole('link', { name: 'Edit' }).first();
    await expect(firstEditButton).toBeVisible();
    await firstEditButton.click();

    // Verify navigasi ke halaman edit user
    await expect(page).toHaveURL(/.*\/users\/.*\/edit/);

    // Ganti nama user untuk ditest
    const editName = `Edited User ${Date.now()}`;
    await page.getByLabel('Full Name').fill(editName);
    
    // Update role
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Admin' }).click();

    await page.getByRole('button', { name: 'Update User' }).click();

    // Verify kembali ke list
    await expect(page).toHaveURL(/.*\/users$/);
    await page.waitForTimeout(1000);
    
    // User yang diedit harus terlihat
    await expect(page.getByText(editName)).toBeVisible();
  });

  test('should successfully delete a user', async ({ page }) => {
    await page.goto('/users');
    
    // Tunggu hidrasi selesai sepenuhnya
    await page.waitForTimeout(1000);

    const firstDeleteButton = page.getByRole('button', { name: 'Delete' }).first();
    await expect(firstDeleteButton).toBeVisible();

    // Terima dialog konfirmasi browser
    page.on('dialog', dialog => dialog.accept());

    await firstDeleteButton.click();

    // Tunggu refresh router
    await expect(page.getByText('User deleted successfully')).toBeVisible();
  });
});
