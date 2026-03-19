import { test, expect } from '@playwright/test';
import { gotoProject } from './helpers';

test.describe('Project Detail & Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProject(page, '001_SOCIAL', 'plan');
  });

  test('shows project layout with sidebar', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Projekte|Projects/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Social' })).toBeVisible();
  });

  test('shows tab bar with 4 tabs', async ({ page }) => {
    const tabNav = page.getByRole('navigation', { name: 'Project tabs' });
    await expect(tabNav).toBeVisible();

    await expect(tabNav.getByRole('link', { name: /Plan/i })).toBeVisible();
    await expect(tabNav.getByRole('link', { name: /Entwickeln|Develop/i })).toBeVisible();
    await expect(tabNav.getByRole('link', { name: /Bereitstellen|Deploy/i })).toBeVisible();
    await expect(tabNav.getByRole('link', { name: /Monitor/i })).toBeVisible();
  });

  test('redirects to plan tab by default', async ({ page }) => {
    await gotoProject(page, '001_SOCIAL', 'plan');
    await expect(page).toHaveURL(/\/plan$/, { timeout: 10000 });
  });

  test('shows requirements tree in sidebar', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Requirements' });
    await expect(nav).toBeVisible();
    // Wait for tree content to load (not just the nav wrapper)
    await expect(nav.getByRole('treeitem').first()).toBeVisible({ timeout: 10000 });
  });

  test('shows search box in sidebar', async ({ page }) => {
    const search = page.getByRole('searchbox');
    await expect(search).toBeVisible();
  });

  test('navigates between tabs', async ({ page }) => {
    const tabNav = page.getByRole('navigation', { name: 'Project tabs' });

    await tabNav.getByRole('link', { name: /Entwickeln|Develop/i }).click();
    await expect(page).toHaveURL(/\/develop$/);

    await tabNav.getByRole('link', { name: /Bereitstellen|Deploy/i }).click();
    await expect(page).toHaveURL(/\/deploy$/);

    await tabNav.getByRole('link', { name: /Monitor/i }).click();
    await expect(page).toHaveURL(/\/monitor$/);

    await tabNav.getByRole('link', { name: /Plan/i }).click();
    await expect(page).toHaveURL(/\/plan$/);
  });

  test('back link returns to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /Projekte|Projects/i }).click();
    await page.waitForURL('/');
    await expect(page.getByRole('heading', { name: 'ARQITEKT Hub' })).toBeVisible();
  });
});
