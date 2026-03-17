import { test, expect } from '@playwright/test';

test.describe('Hub Dashboard', () => {
  test('loads the dashboard', async ({ page }) => {
    await page.goto('/');
    // Should show the Hub Dashboard (check for heading or project list)
    await expect(page.locator('h1, [data-testid="dashboard"]')).toBeVisible();
  });

  test('navigates to project detail', async ({ page }) => {
    await page.goto('/');
    // If there are project cards, click the first one
    const cards = page.locator('[role="link"]');
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      await expect(page).toHaveURL(/\/projects\//);
    }
  });

  test('shows create project button', async ({ page }) => {
    await page.goto('/');
    // Look for a create/add button
    const btn = page.getByRole('button', { name: /erstellen|create|neu|new/i });
    await expect(btn).toBeVisible();
  });
});
