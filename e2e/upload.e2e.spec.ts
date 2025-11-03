import { test, expect } from '@playwright/test';

test('Upload zdjęcia', async ({ page }) => {
  await page.goto('/breeder-meetings');
  await page.getByText(/Dodaj spotkanie/).click();
  await page.setInputFiles('input[type="file"]', 'public/logo.png');
  await page.getByText(/Wyślij zdjęcia/).click();
  await expect(page.getByText(/Zdjęcia zostały przesłane/)).toBeVisible();
});
