import { test, expect } from '@playwright/test';

test('Licytacja gołębia', async ({ page }) => {
  await page.goto('/auctions');
  await page
    .getByText(/Szczegóły/)
    .first()
    .click();
  await page.fill('input[name="amount"]', '1050');
  await page.getByText(/Licytuj teraz/).click();
  await expect(page.getByText(/Licytacja została dodana/)).toBeVisible();
});
