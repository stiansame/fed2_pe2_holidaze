import { expect, test } from '@playwright/test';

test('unknown routes show a useful 404 page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to home', exact: true })).toHaveAttribute('href', '/');
  await expect(page).toHaveTitle('Holidaze | Page not found');
});

test('signed-out visitors must log in before opening their account', async ({ page }) => {
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('textbox', { name: /^Email/ })).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
});
