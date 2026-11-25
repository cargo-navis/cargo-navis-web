import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';

/**
 * Small UI helpers shared by the specs. Keep them to steps that repeat across areas; anything specific to one page
 * stays in its spec.
 */

/** The toast whose title is `title` (exact text; toasts have no full stop, KAN-55). */
export function toast(page: Page, title: string | RegExp): Locator {
  return page.locator('[data-slot="toast-title"]').filter({ hasText: title }).first();
}

/** Waits for a toast with this title, and optionally its description line. */
export async function expectToast(page: Page, title: string | RegExp, description?: string | RegExp) {
  const item = toast(page, title);
  await expect(item).toBeVisible();
  if (description !== undefined) {
    await expect(
      page.locator('[data-slot="toast-description"]').filter({ hasText: description }).first()
    ).toBeVisible();
  }
}

/** Types into a combobox (Base UI) and picks the option whose accessible name matches. */
export async function pick(page: Page, combobox: Locator, text: string, option: string | RegExp = text) {
  await combobox.fill(text);
  await page.getByRole('option', { name: option }).first().click();
}

/** True in the phone project (iPhone viewport): layouts differ (sheets instead of dialogs, cards instead of tables). */
export const isPhone = (testInfo: TestInfo) => testInfo.project.name === 'phone';
