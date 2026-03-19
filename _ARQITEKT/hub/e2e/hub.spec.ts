import { test, expect } from '@playwright/test';
import { gotoDashboard } from './helpers';

test.describe('Hub Dashboard', () => {
  test('loads the dashboard', async ({ page }) => {
    await gotoDashboard(page);
    await expect(page.getByRole('heading', { name: 'ARQITEKT Hub' })).toBeVisible();
  });

  test('navigates to project detail', async ({ page }) => {
    await gotoDashboard(page);
    await page.getByRole('link', { name: 'Social' }).click();
    await expect(page).toHaveURL(/\/projects\//);
  });

  test('shows create project button', async ({ page }) => {
    await gotoDashboard(page);
    const btn = page.getByRole('button', { name: /erstellen|create|neu|new/i });
    await expect(btn).toBeVisible();
  });
});
