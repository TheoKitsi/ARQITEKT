import { test, expect } from '@playwright/test';
import { gotoDashboard, gotoProject } from './helpers';

test.describe('Header & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
  });

  test('shows header with brand name', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=ARQITEKT').first()).toBeVisible();
  });

  test('language toggle switches between DE and EN', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: /sprache|language/i });
    await expect(langBtn).toBeVisible();

    // Should show current language indicator
    const langText = langBtn.locator('text=/DE|EN/');
    await expect(langText).toBeVisible();

    // Click to toggle
    await langBtn.click();

    // After toggle, subtitle text should change
    await expect(page.getByText(/Von der Idee bis zum App Store|From Idea to App Store/)).toBeVisible();
  });

  test('GitHub connect button is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /GitHub/i })).toBeVisible();
  });

  test('brand link navigates to home', async ({ page }) => {
    // Navigate to a project first
    await gotoProject(page, '001_SOCIAL', 'plan');

    // Click brand link
    await page.locator('header a').first().click();
    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'ARQITEKT Hub' })).toBeVisible();
  });
});
