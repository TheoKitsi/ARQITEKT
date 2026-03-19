import { test, expect } from '@playwright/test';
import { gotoProject } from './helpers';

test.describe('Develop Tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProject(page, '001_SOCIAL', 'develop');
  });

  test('shows file explorer panel', async ({ page }) => {
    await expect(page.getByText('DATEIEN').first()).toBeVisible();
  });

  test('shows code editor placeholder', async ({ page }) => {
    await expect(page.getByText(/Code Editor/i).first()).toBeVisible();
  });

  test('shows terminal panel', async ({ page }) => {
    await expect(page.getByText('Terminal').first()).toBeVisible();
  });

  test('has terminal action buttons', async ({ page }) => {
    await expect(page.getByText('Ausführen').first()).toBeVisible();
    await expect(page.getByText('Leeren').first()).toBeVisible();
  });
});

test.describe('Deploy Tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProject(page, '001_SOCIAL', 'deploy');
  });

  test('shows deploy action tiles', async ({ page }) => {
    await expect(page.getByText('Scaffold').first()).toBeVisible();
    await expect(page.getByText(/Generieren|Generate/i).first()).toBeVisible();
    await expect(page.getByText(/Build.*Deploy/i).first()).toBeVisible();
  });

  test('shows GitHub section', async ({ page }) => {
    await expect(page.getByText(/Exportieren|Export/i).first()).toBeVisible();
    await expect(page.getByText(/Push/i).first()).toBeVisible();
  });
});

test.describe('Monitor Tab', () => {
  test.beforeEach(async ({ page }) => {
    await gotoProject(page, '001_SOCIAL', 'monitor');
  });

  test('shows app status panel', async ({ page }) => {
    await expect(page.getByText(/App-Status/i).first()).toBeVisible();
  });

  test('shows start/stop/restart buttons', async ({ page }) => {
    await expect(page.getByText('Starten').first()).toBeVisible();
    await expect(page.getByText('Stoppen').first()).toBeVisible();
    await expect(page.getByText('Neustart').first()).toBeVisible();
  });

  test('shows feedback panel', async ({ page }) => {
    await expect(page.getByText('Feedback').first()).toBeVisible();
  });

  test('shows validation panel', async ({ page }) => {
    await expect(page.getByText(/Validierung/i).first()).toBeVisible();
  });

  test('has add feedback button', async ({ page }) => {
    await expect(page.getByText(/Hinzufügen/i).first()).toBeVisible();
  });

  test('has run validation button', async ({ page }) => {
    await expect(page.getByText(/Validierung starten/i).first()).toBeVisible();
  });
});
