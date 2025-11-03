import { test, expect } from '@playwright/test';

test('Rejestracja i logowanie', async ({ page }) => {
  await page.goto('/');
  await page.getByText(/Zarejestruj/).click();
  await page.fill('input[name="email"]', `test${Date.now()}@mtm.pl`);
  await page.fill('input[name="password"]', 'test123#MTM');
  await page.getByText(/Zarejestruj/).click();
  await expect(page.getByText(/Konto utworzone/)).toBeVisible();
});
