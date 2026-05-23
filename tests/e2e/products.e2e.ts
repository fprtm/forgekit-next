import { test, expect } from '@playwright/test';

test.describe.serial('Products Module E2E', () => {
  test('should navigate to products page and display the list', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Check if the page title or main heading exists
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Check if the Create Product button exists
    await expect(page.getByRole('link', { name: 'Create Product' })).toBeVisible();
  });

  test('should navigate to create product page', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('link', { name: 'Create Product' }).click();

    // Verify URL
    await expect(page).toHaveURL(/.*\/products\/create/);

    // Verify form exists
    await expect(page.getByRole('heading', { name: 'Create Product' })).toBeVisible();
    await expect(page.getByLabel('Product Name')).toBeVisible();
    await expect(page.getByLabel('Price')).toBeVisible();
  });

  test('should successfully create a new product and see it in the list', async ({ page }) => {
    const uniqueProductName = `Test Product ${Date.now()}`;
    await page.goto('/products/create');
    await page.getByLabel('Product Name').fill(uniqueProductName);
    await page.getByLabel('Price').fill('15000');
    await page.getByRole('button', { name: 'Create Product' }).click();

    await expect(page).toHaveURL(/.*\/products$/);
    await page.waitForTimeout(1000);
    await expect(page.getByText(uniqueProductName)).toBeVisible();
  });

  test('should successfully edit a product', async ({ page }) => {
    await page.goto('/products');
    
    // Tunggu hidrasi selesai sepenuhnya
    await page.waitForTimeout(1000);
    
    // Asumsikan ada product dari test sebelumnya (atau seeder).
    // Kita cari row pertama yang memiliki tombol Edit.
    const firstEditButton = page.getByRole('link', { name: 'Edit' }).first();
    
    // Pastikan setidaknya ada satu tombol Edit
    await expect(firstEditButton).toBeVisible();
    await firstEditButton.click();

    // Verify navigasi ke halaman edit
    await expect(page).toHaveURL(/.*\/products\/.*\/edit/);

    const editName = `Edited Product ${Date.now()}`;
    await page.getByLabel('Product Name').fill(editName);
    await page.getByLabel('Price').fill('20000');
    
    // Perhatikan UI mungkin punya text "Update Product" berdasarkan isEditing ternary operator
    await page.getByRole('button', { name: 'Update Product' }).click();

    // Verify kembali ke list
    await expect(page).toHaveURL(/.*\/products$/);
    await page.waitForTimeout(1000);
    
    // Product yang diedit harus terlihat dengan harga $20,000.00
    await expect(page.getByText(editName)).toBeVisible();
  });

  test('should successfully delete a product', async ({ page }) => {
    await page.goto('/products');
    
    // Tunggu hidrasi selesai sepenuhnya
    await page.waitForTimeout(1000);

    const firstDeleteButton = page.getByRole('button', { name: 'Delete' }).first();
    await expect(firstDeleteButton).toBeVisible();

    // Terima dialog konfirmasi browser
    page.on('dialog', dialog => dialog.accept());

    await firstDeleteButton.click();

    // Tunggu refresh router (toast success akan muncul)
    await expect(page.getByText('Product deleted successfully')).toBeVisible();
  });

  // Note: Testing actual creation/deletion involves the database. 
  // In a real boilerplate CI pipeline, we'd seed a test database before running this.
  // For now, we test the UI navigation and client-side validation.
  test('should show validation errors on empty form submit', async ({ page }) => {
    await page.goto('/products/create');
    await page.getByRole('button', { name: 'Create Product' }).click();

    // The zod validation should show errors
    await expect(page.getByText('String must contain at least 2 character(s)')).toBeVisible();
    // Price default is 0 so it might complain about Price must be greater than 0
    await expect(page.getByText('Price must be greater than 0')).toBeVisible();
  });
});
