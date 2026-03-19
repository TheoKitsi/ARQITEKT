import { test, expect } from '@playwright/test';
import { gotoDashboard, gotoProject } from './helpers';

test.describe('Cross-Project Navigation', () => {
  test('navigates between different projects', async ({ page }) => {
    await gotoDashboard(page);

    // Navigate to Social
    await page.getByRole('link', { name: 'Social' }).click();
    await page.waitForURL(/\/projects\/001_SOCIAL/);
    await expect(page.getByRole('heading', { name: 'Social' })).toBeVisible({ timeout: 45000 });

    // Go back to dashboard
    await page.getByRole('link', { name: /Projekte|Projects/i }).click();
    await page.waitForURL('/');

    // Navigate to WealthPilot
    await page.getByRole('link', { name: 'WealthPilot' }).click();
    await page.waitForURL(/\/projects\/005_WEALTHPILOT/);
    await expect(page.getByRole('heading', { name: 'WealthPilot' })).toBeVisible({ timeout: 45000 });
  });

  test('direct URL navigation works for each project', async ({ page }) => {
    for (const [id, name] of [
      ['001_SOCIAL', 'Social'],
      ['002_RELAY', 'Relay'],
      ['003_TRUSTGATE', 'TrustGate'],
    ] as const) {
      await gotoProject(page, id, 'plan');
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
  });

  test('navigates to all tabs via URL', async ({ page }) => {
    const tabs = ['plan', 'develop', 'deploy', 'monitor'];
    for (const tab of tabs) {
      await gotoProject(page, '001_SOCIAL', tab);
      await expect(page).toHaveURL(new RegExp(`/${tab}$`));
    }
  });
});

test.describe('i18n Language Toggle', () => {
  test('toggles between German and English', async ({ page }) => {
    // Only need the shell (header + language button), not project data
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'ARQITEKT Hub' })).toBeVisible({ timeout: 30000 });

    const langBtn = page.getByRole('button', { name: /sprache|language/i });
    await expect(langBtn).toBeVisible({ timeout: 15000 });
    await langBtn.click();
    await page.waitForTimeout(500);

    // After toggle, the subtitle should be visible in either language
    await expect(page.getByText(/Von der Idee bis zum App Store|From Idea to App Store/)).toBeVisible();

    // Toggle back
    await langBtn.click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Von der Idee bis zum App Store|From Idea to App Store/)).toBeVisible();
  });
});

test.describe('API Integration', () => {
  const apiBase = `http://localhost:${process.env.E2E_API_PORT || '3335'}`;

  test('projects API returns data', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/projects`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThanOrEqual(6);
  });

  test('project detail API returns correct data', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/projects/001_SOCIAL`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.config.name).toBe('Social');
    expect(data.config.lifecycle).toBe('built');
  });

  test('requirements stats API works', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/projects/001_SOCIAL`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.stats).toBeDefined();
    expect(data.stats.sol).toBeGreaterThan(0);
  });
});
