import { Page, expect } from '@playwright/test';

/**
 * Navigate to the dashboard and ensure project data is loaded.
 */
export async function gotoDashboard(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'ARQITEKT Hub' })).toBeVisible({ timeout: 30000 });
  // Project data may take time to load through Vite proxy; retry reload once if needed
  try {
    await expect(page.getByRole('heading', { name: 'Social', level: 3 })).toBeVisible({ timeout: 30000 });
  } catch {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Social', level: 3 })).toBeVisible({ timeout: 30000 });
  }
}

/**
 * Navigate to a project detail page and ensure project data is loaded.
 */
export async function gotoProject(page: Page, projectId: string, tab: string = 'plan') {
  await page.goto(`/projects/${projectId}/${tab}`, { waitUntil: 'domcontentloaded' });
  const heading = page.getByRole('heading', { name: /Social|Relay|TrustGate|Prospect|WealthPilot|SCS Play/, level: 2 });
  try {
    await expect(heading).toBeVisible({ timeout: 30000 });
  } catch {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(heading).toBeVisible({ timeout: 30000 });
  }
}
