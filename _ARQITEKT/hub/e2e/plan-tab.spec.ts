import { test, expect } from '@playwright/test';
import { gotoProject } from './helpers';

test.describe('Plan Tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProject(page, '001_SOCIAL', 'plan');
  });

  test('shows stats bar with artifact counts', async ({ page }) => {
    // StatsBar section should be visible with artifact labels
    const statsBar = page.locator('section').filter({ hasText: /Idee|Gates/ });
    await expect(statsBar.first()).toBeVisible();
  });

  test('shows solution cards as articles', async ({ page }) => {
    // SolutionCard renders <article> elements with SOL ID badges
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    // Each card has an SOL ID badge (e.g. SOL-1)
    const idBadge = firstCard.getByText(/^SOL-\d+$/);
    await expect(idBadge).toBeVisible();
  });

  test('solution cards have progress dots', async ({ page }) => {
    // Each SolutionCard has a dots div with aria-label "Fortschritt"
    const dots = page.locator('[aria-label="Fortschritt"]').first();
    await expect(dots).toBeVisible({ timeout: 15000 });
  });

  test('requirements tree is visible in sidebar', async ({ page }) => {
    // Requirements tree should show BC and cross-cutting items
    const tree = page.getByRole('tree', { name: 'Anforderungen' });
    await expect(tree).toBeVisible();
    await expect(page.getByRole('treeitem', { name: /BC.*Business Case/ })).toBeVisible();
  });

  test('multiple solution cards are present', async ({ page }) => {
    // Social project has multiple SOL items
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
