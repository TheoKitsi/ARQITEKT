import { test, expect } from '@playwright/test';
import { gotoDashboard } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoDashboard(page);
  });

  test('renders hub hero section with heading and subtitle', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ARQITEKT Hub' })).toBeVisible();
    // German subtitle (default language)
    await expect(page.locator('text=Von der Idee bis zum App Store')).toBeVisible();
  });

  test('shows three hero action buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Von der Idee zur App/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Neues Projekt/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Import/i })).toBeVisible();
  });

  test('displays at least 6 project cards', async ({ page }) => {
    const cards = page.getByRole('link').filter({ has: page.getByRole('heading', { level: 3 }) });
    await expect(cards.first()).toBeVisible();
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('shows correct project names', async ({ page }) => {
    for (const name of ['Social', 'Relay', 'TrustGate', 'Prospect', 'WealthPilot', 'SCS Play']) {
      await expect(page.getByRole('heading', { name, level: 3 })).toBeVisible();
    }
  });

  test('shows lifecycle badges with correct values', async ({ page }) => {
    // Social and SCS Play should be "Gebaut"
    const socialCard = page.getByRole('link', { name: 'Social' });
    await expect(socialCard.locator('text=Gebaut')).toBeVisible();

    const scsCard = page.getByRole('link', { name: 'SCS Play' });
    await expect(scsCard.locator('text=Gebaut')).toBeVisible();

    // WealthPilot should be "Bereit"
    const wpCard = page.getByRole('link', { name: 'WealthPilot' });
    await expect(wpCard.locator('text=Bereit')).toBeVisible();

    // Relay should be "Planung"
    const relayCard = page.getByRole('link', { name: 'Relay' });
    await expect(relayCard.locator('text=Planung')).toBeVisible();
  });

  test('shows project stats (solutions, scenarios, blocks, features)', async ({ page }) => {
    const socialCard = page.getByRole('link', { name: 'Social' });
    await expect(socialCard.locator('text=17')).toBeVisible();
    await expect(socialCard.locator('text=26')).toBeVisible();
    await expect(socialCard.locator('text=29')).toBeVisible();
    await expect(socialCard.locator('text=130')).toBeVisible();
  });

  test('shows project descriptions', async ({ page }) => {
    await expect(page.locator('text=Long-Term Relationship Dating Platform')).toBeVisible();
    await expect(page.locator('text=Verified successor tenant search')).toBeVisible();
  });
});
